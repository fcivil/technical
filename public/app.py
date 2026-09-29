#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════════╗
║   سامانه جامع انضباطی و ارزشیابی هنرستان - نسخه ۱.۰       ║
║   Single-File Flask Application                            ║
╠══════════════════════════════════════════════════════════════╣
║   نحوه اجرا:                                                ║
║   1. pip install flask                                      ║
║   2. python app.py                                          ║
║   3. مرورگر: http://localhost:5000                          ║
║                                                              ║
║   استقرار در Cloudflare / Railway / Render:                 ║
║   - فایل را در GitHub قرار دهید                             ║
║   - Railway: متصل کردن ریپازیتوری                           ║
║   - Render: New Web Service → Connect GitHub                ║
║   - Cloudflare: استفاده از Cloudflare Tunnel یا CDN        ║
╚══════════════════════════════════════════════════════════════╝
"""

import os, json, hashlib, sqlite3, secrets, io, csv
from datetime import datetime, timedelta
from functools import wraps
from flask import (Flask, render_template_string, request, redirect,
                   url_for, session, jsonify, g, make_response)

# ═══════════════════════════════════════════
# تنظیمات
# ═══════════════════════════════════════════
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))
DB = os.environ.get('DATABASE_PATH', 'school.db')
PORT = int(os.environ.get('PORT', 5000))

# ═══════════════════════════════════════════
# دیتابیس
# ═══════════════════════════════════════════
def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA journal_mode=WAL")
    return g.db

@app.teardown_appcontext
def close_db(exc):
    db = g.pop('db', None)
    if db: db.close()

def init_db():
    db = sqlite3.connect(DB)
    db.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        national_id TEXT UNIQUE,
        role TEXT DEFAULT 'teacher',
        password TEXT,
        field TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        national_id TEXT UNIQUE,
        field TEXT, grade TEXT, class_name TEXT,
        phone TEXT, parent_phone TEXT,
        discipline_score INTEGER DEFAULT 100,
        attendance_rate INTEGER DEFAULT 100,
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER, date TEXT,
        status TEXT DEFAULT 'present',
        period INTEGER DEFAULT 1, note TEXT,
        FOREIGN KEY(student_id) REFERENCES students(id)
    );
    CREATE TABLE IF NOT EXISTS discipline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER, type TEXT,
        category TEXT, description TEXT,
        points INTEGER DEFAULT 0, date TEXT,
        recorded_by TEXT, status TEXT DEFAULT 'active',
        FOREIGN KEY(student_id) REFERENCES students(id)
    );
    CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER, subject TEXT,
        grade_type TEXT, score REAL, max_score REAL DEFAULT 20,
        weight REAL DEFAULT 10, date TEXT, semester INTEGER DEFAULT 1,
        FOREIGN KEY(student_id) REFERENCES students(id)
    );
    CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT, content TEXT,
        type TEXT DEFAULT 'info', date TEXT,
        pinned INTEGER DEFAULT 0, target_roles TEXT DEFAULT 'all'
    );
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY, value TEXT
    );
    """)
    db.close()

def seed_data():
    db = sqlite3.connect(DB)
    # Check if data exists
    if db.execute("SELECT COUNT(*) FROM users").fetchone()[0] > 0:
        db.close(); return
    # Users
    users = [
        ('مدیر سیستم', '0000000001', 'admin', hashlib.sha256('admin'.encode()).hexdigest(), None),
        ('آقای محمدی', '0000000002', 'teacher', hashlib.sha256('1234'.encode()).hexdigest(), 'ریاضی'),
        ('آقای کریمی', '0000000003', 'teacher', hashlib.sha256('1234'.encode()).hexdigest(), 'فیزیک'),
        ('خانم احمدی', '0000000004', 'counselor', hashlib.sha256('1234'.encode()).hexdigest(), None),
    ]
    db.executemany("INSERT INTO users(name,national_id,role,password,field) VALUES(?,?,?,?,?)", users)
    # Students
    students = [
        ('علی احمدی','0012345678','کامپیوتر','یازدهم','کامپیوتر ۱','09121234567','09131234567',85,95),
        ('محمد رضایی','0023456789','برق','دهم','برق ۱','09122345678','09132345678',72,88),
        ('حسین کریمی','0034567890','مکانیک','یازدهم','مکانیک ۱','09123456789','09133456789',90,97),
        ('رضا محمدی','0045678901','کامپیوتر','دوازدهم','کامپیوتر ۲','09124567890','09134567890',65,82),
        ('امیر حسینی','0056789012','برق','دهم','برق ۲','09125678901','09135678901',95,99),
        ('سعید نوری','0067890123','مکانیک','یازدهم','مکانیک ۲','09126789012','09136789012',78,91),
        ('مهدی صادقی','0078901234','کامپیوتر','دوازدهم','کامپیوتر ۱','09127890123','09137890123',88,94),
        ('جواد عباسی','0089012345','برق','یازدهم','برق ۱','09128901234','09138901234',55,75),
        ('احمد موسوی','0090123456','مکانیک','دهم','مکانیک ۱','09129012345','09139012345',82,90),
        ('کاظم باقری','0101234567','کامپیوتر','یازدهم','کامپیوتر ۲','09120123456','09130123456',70,85),
    ]
    db.executemany("INSERT INTO students(name,national_id,field,grade,class_name,phone,parent_phone,discipline_score,attendance_rate) VALUES(?,?,?,?,?,?,?,?,?)", students)
    # Discipline
    disc = [
        (1,'positive','نظم و انضباط','حضور به‌موقع مستمر',5,'1404/03/15','آقای محمدی','active'),
        (2,'negative','غیبت','غیبت غیرموجه در درس ریاضی',-3,'1404/03/14','آقای کریمی','active'),
        (3,'positive','فعالیت کلاسی','مشارکت فعال در پروژه عملی',8,'1404/03/13','آقای محمدی','active'),
        (4,'negative','رفتار نامناسب','استفاده از تلفن همراه در کلاس',-5,'1404/03/12','آقای کریمی','appealed'),
        (5,'positive','مسابقه','کسب مقام اول مسابقه فنی',15,'1404/03/11','مدیر','active'),
        (8,'negative','تأخیر','تأخیر مکرر',-4,'1404/03/10','ناظم','active'),
        (6,'positive','کمک به دیگران','کمک به هم‌کلاسی در آزمایشگاه',3,'1404/03/09','آقای کریمی','active'),
        (1,'positive','نمره','نمره کامل در آزمون عملی',10,'1404/03/08','آقای محمدی','active'),
    ]
    db.executemany("INSERT INTO discipline(student_id,type,category,description,points,date,recorded_by,status) VALUES(?,?,?,?,?,?,?,?)", disc)
    # Grades
    grades = [
        (1,'ریاضی','quiz',18,20,10,'1404/03/10',1),(1,'ریاضی','midterm',17,20,30,'1404/02/20',1),
        (1,'فیزیک','quiz',19,20,10,'1404/03/12',1),(1,'فیزیک','homework',20,20,10,'1404/03/08',1),
        (2,'ریاضی','quiz',14,20,10,'1404/03/10',1),(2,'ریاضی','midterm',12,20,30,'1404/02/20',1),
        (3,'کارگاه مکانیک','practical',19.5,20,40,'1404/03/11',1),(3,'ریاضی','quiz',18.5,20,10,'1404/03/10',1),
        (5,'مدار الکتریکی','practical',20,20,40,'1404/03/13',1),(8,'ریاضی','quiz',10,20,10,'1404/03/10',1),
        (4,'برنامه‌سازی','project',16,20,25,'1404/03/11',1),(6,'نقشه‌کشی','practical',17,20,35,'1404/03/09',1),
        (7,'شبکه','midterm',18,20,30,'1404/03/07',1),(9,'جوشکاری','practical',15,20,40,'1404/03/12',1),
        (10,'ریاضی','quiz',13,20,10,'1404/03/10',1),(10,'فیزیک','midterm',11,20,30,'1404/02/20',1),
    ]
    db.executemany("INSERT INTO grades(student_id,subject,grade_type,score,max_score,weight,date,semester) VALUES(?,?,?,?,?,?,?,?)", grades)
    # Announcements
    anns = [
        ('اطلاعیه امتحانات پایان ترم','امتحانات از تاریخ ۱۴۰۴/۰۴/۰۱ آغاز می‌شود.','urgent','1404/03/15',1,'all'),
        ('جلسه اولیا و مربیان','جلسه روز پنجشنبه ساعت ۱۶ در سالن اجتماعات.','info','1404/03/14',0,'all'),
        ('مسابقه فنی','ثبت‌نام مسابقه فنی بین هنرستان‌ها آغاز شد.','success','1404/03/12',0,'all'),
        ('تذکر انضباطی','استفاده از تلفن همراه در ساعات آموزشی ممنوع است.','warning','1404/03/10',1,'all'),
    ]
    db.executemany("INSERT INTO announcements(title,content,type,date,pinned,target_roles) VALUES(?,?,?,?,?,?)", anns)
    db.commit(); db.close()

# ═══════════════════════════════════════════
# احراز هویت
# ═══════════════════════════════════════════
def login_required(f):
    @wraps(f)
    def decorated(*a, **kw):
        if 'uid' not in session:
            return jsonify(error='لطفاً وارد شوید'), 401
        return f(*a, **kw)
    return decorated

def role_required(*roles):
    def dec(f):
        @wraps(f)
        def decorated(*a, **kw):
            if session.get('role') not in roles:
                return jsonify(error='دسترسی غیرمجاز'), 403
            return f(*a, **kw)
        return decorated
    return dec

# ═══════════════════════════════════════════
# قالب HTML اصلی (SPA)
# ═══════════════════════════════════════════
TPL = r"""<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>سامانه جامع انضباطی و ارزشیابی هنرستان</title>
<style>
@import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Regular.woff2');
*{margin:0;padding:0;box-sizing:border-box;font-family:Vazirmatn,system-ui,sans-serif}
:root{
--bg:#f8fafc;--bg2:#fff;--bg3:#f1f5f9;--tx:#1e293b;--tx2:#64748b;--tx3:#94a3b8;
--bd:#e2e8f0;--pr:#10b981;--pr2:#059669;--pr3:#d1fae5;--pr4:#ecfdf5;
--dn:#ef4444;--dn3:#fee2e2;--wn:#f59e0b;--wn3:#fef3c7;--bl:#3b82f6;--bl3:#dbeafe;
--pp:#8b5cf6;--pp3:#ede9fe;
}
.dark{--bg:#0f172a;--bg2:#1e293b;--bg3:#334155;--tx:#f1f5f9;--tx2:#94a3b8;--tx3:#64748b;
--bd:#334155;--pr3:#064e3b;--pr4:#022c22;--dn3:#450a0a;--wn3:#451a03;--bl3:#1e3a5f;--pp3:#2e1065}
body{background:var(--bg);color:var(--tx);min-height:100vh}
a{color:inherit;text-decoration:none}
/* Login */
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem;
background:linear-gradient(135deg,#ecfdf5,#fff,#f0fdfa)}
.dark .login-wrap{background:linear-gradient(135deg,#0f172a,#1e293b,#022c22)}
.login-card{background:var(--bg2);border-radius:1.5rem;padding:2rem;width:100%;max-width:28rem;
border:1px solid var(--bd);box-shadow:0 20px 60px rgba(0,0,0,.1)}
.login-logo{width:5rem;height:5rem;margin:0 auto 1rem;border-radius:1rem;
background:linear-gradient(135deg,#059669,#10b981,#34d399);display:flex;align-items:center;
justify-content:center;font-size:2rem;color:#fff}
.role-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin:1.5rem 0}
.role-btn{padding:.75rem .5rem;border-radius:.75rem;border:2px solid var(--bd);background:var(--bg);
cursor:pointer;text-align:center;transition:.2s;font-size:.8rem;color:var(--tx)}
.role-btn:hover,.role-btn.active{border-color:var(--pr);background:var(--pr4);color:var(--pr2)}
.dark .role-btn:hover,.dark .role-btn.active{background:var(--pr4)}
.input{width:100%;padding:.75rem 1rem;border-radius:.75rem;border:1px solid var(--bd);
background:var(--bg);color:var(--tx);font-size:.9rem;margin-bottom:.75rem;outline:none;transition:.2s}
.input:focus{border-color:var(--pr);box-shadow:0 0 0 3px rgba(16,185,129,.15)}
.btn{padding:.75rem 1.5rem;border-radius:.75rem;border:none;cursor:pointer;font-size:.9rem;
font-weight:600;transition:.2s;display:inline-flex;align-items:center;gap:.5rem}
.btn-primary{background:linear-gradient(135deg,#059669,#10b981);color:#fff}
.btn-primary:hover{opacity:.9;transform:translateY(-1px);box-shadow:0 4px 12px rgba(16,185,129,.3)}
.btn-outline{background:transparent;border:1px solid var(--bd);color:var(--tx)}
.btn-outline:hover{background:var(--bg3)}
.btn-sm{padding:.4rem .75rem;font-size:.8rem;border-radius:.5rem}
.btn-danger{background:var(--dn);color:#fff}
.btn-danger:hover{opacity:.9}
/* Layout */
.app{display:flex;min-height:100vh}
.sidebar{width:16rem;background:var(--bg2);border-left:1px solid var(--bd);display:flex;
flex-direction:column;position:fixed;right:0;top:0;bottom:0;z-index:40;transition:.3s}
.sidebar-hidden{transform:translateX(100%)}
.main{flex:1;margin-right:16rem;display:flex;flex-direction:column;min-height:100vh}
.header{background:var(--bg2);border-bottom:1px solid var(--bd);padding:.75rem 1.5rem;
display:flex;align-items:center;justify-content:between;position:sticky;top:0;z-index:30;
backdrop-filter:blur(10px)}
.content{flex:1;padding:1.5rem}
.nav-item{display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;border-radius:.75rem;
cursor:pointer;transition:.2s;color:var(--tx2);font-size:.9rem;margin:2px 0}
.nav-item:hover{background:var(--bg3);color:var(--tx)}
.nav-item.active{background:var(--pr4);color:var(--pr2);font-weight:600}
.dark .nav-item.active{background:rgba(16,185,129,.1)}
/* Cards */
.card{background:var(--bg2);border:1px solid var(--bd);border-radius:1rem;padding:1.25rem;transition:.2s}
.card:hover{box-shadow:0 4px 12px rgba(0,0,0,.05)}
.stat-card{display:flex;align-items:flex-start;justify-content:space-between}
.stat-icon{width:3rem;height:3rem;border-radius:.75rem;display:flex;align-items:center;
justify-content:center;font-size:1.25rem;color:#fff}
.stat-value{font-size:1.75rem;font-weight:700;color:var(--tx)}
.stat-label{font-size:.8rem;color:var(--tx2)}
/* Grid */
.grid{display:grid;gap:1rem}
.grid-2{grid-template-columns:repeat(2,1fr)}
.grid-3{grid-template-columns:repeat(3,1fr)}
.grid-4{grid-template-columns:repeat(4,1fr)}
@media(max-width:1024px){.grid-4{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.grid-2,.grid-3,.grid-4{grid-template-columns:1fr}
.sidebar{transform:translateX(100%)}.sidebar.show{transform:translateX(0)}
.main{margin-right:0}}
/* Table */
.tbl-wrap{overflow-x:auto;border-radius:.75rem;border:1px solid var(--bd)}
table{width:100%;border-collapse:collapse}
th{background:var(--bg3);padding:.75rem 1rem;text-align:right;font-size:.8rem;
color:var(--tx2);font-weight:600}
td{padding:.75rem 1rem;border-top:1px solid var(--bd);font-size:.85rem}
tr:hover td{background:var(--bg3)}
/* Badge */
.badge{display:inline-flex;align-items:center;gap:.25rem;padding:.2rem .6rem;
border-radius:2rem;font-size:.75rem;font-weight:600}
.badge-green{background:var(--pr3);color:#059669}
.badge-red{background:var(--dn3);color:#dc2626}
.badge-blue{background:var(--bl3);color:#2563eb}
.badge-amber{background:var(--wn3);color:#d97706}
.badge-purple{background:var(--pp3);color:#7c3aed}
/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:50;
display:flex;align-items:center;justify-content:center;padding:1rem;animation:fadeIn .2s}
.modal{background:var(--bg2);border-radius:1rem;padding:1.5rem;width:100%;max-width:32rem;
max-height:90vh;overflow-y:auto;border:1px solid var(--bd);animation:slideUp .3s}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
/* Toast */
.toast-container{position:fixed;top:1rem;left:1rem;z-index:100;display:flex;flex-direction:column;gap:.5rem}
.toast{padding:.75rem 1rem;border-radius:.75rem;color:#fff;font-size:.85rem;
animation:slideIn .3s;box-shadow:0 4px 12px rgba(0,0,0,.15)}
.toast-success{background:#059669}.toast-error{background:#dc2626}.toast-info{background:#2563eb}
@keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
/* Progress */
.progress{height:.5rem;background:var(--bg3);border-radius:1rem;overflow:hidden}
.progress-bar{height:100%;border-radius:1rem;transition:width .5s}
/* Form */
.form-group{margin-bottom:1rem}
.form-label{display:block;font-size:.85rem;font-weight:500;color:var(--tx);margin-bottom:.35rem}
select.input{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
background-repeat:no-repeat;background-position:left 1rem center}
textarea.input{resize:none;min-height:5rem}
/* Misc */
.flex{display:flex}.items-center{align-items:center}.justify-between{justify-content:space-between}
.gap-1{gap:.25rem}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}
.mb-1{margin-bottom:.25rem}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.mb-4{margin-bottom:1rem}
.mt-2{margin-top:.5rem}.mt-4{margin-top:1rem}
.text-sm{font-size:.85rem}.text-xs{font-size:.75rem}.text-lg{font-size:1.1rem}
.text-xl{font-size:1.25rem}.text-2xl{font-size:1.5rem}.text-3xl{font-size:2rem}
.font-bold{font-weight:700}.font-medium{font-weight:500}
.text-center{text-align:center}.text-green{color:var(--pr)}.text-red{color:var(--dn)}
.text-blue{color:var(--bl)}.text-amber{color:var(--wn)}
.w-full{width:100%}.hidden{display:none!important}
.rounded-full{border-radius:50%}
.avatar{width:2.5rem;height:2.5rem;border-radius:.75rem;display:flex;align-items:center;
justify-content:center;font-weight:700;color:#fff;font-size:1rem;
background:linear-gradient(135deg,#059669,#10b981)}
.avatar-lg{width:4rem;height:4rem;border-radius:1rem;font-size:1.5rem}
.page-title{font-size:1.25rem;font-weight:700;color:var(--tx);margin-bottom:.25rem}
.page-desc{font-size:.85rem;color:var(--tx2);margin-bottom:1.5rem}
.welcome-banner{background:linear-gradient(135deg,#059669,#10b981,#34d399);border-radius:1rem;
padding:1.5rem;color:#fff;position:relative;overflow:hidden;margin-bottom:1.5rem}
.welcome-banner::after{content:'';position:absolute;top:-50%;left:-20%;width:200%;height:200%;
background:radial-gradient(circle,rgba(255,255,255,.1) 0%,transparent 60%)}
.filter-bar{background:var(--bg2);border:1px solid var(--bd);border-radius:.75rem;padding:1rem;
margin-bottom:1rem;display:flex;gap:.75rem;flex-wrap:wrap;align-items:center}
.empty-state{text-align:center;padding:3rem;color:var(--tx3)}
.empty-state .icon{font-size:3rem;margin-bottom:.5rem}
.tab-btn{padding:.5rem 1rem;border-radius:.5rem;border:none;background:transparent;
color:var(--tx2);cursor:pointer;font-size:.85rem;transition:.2s}
.tab-btn.active{background:var(--pr);color:#fff}
.att-btn{padding:.35rem .6rem;border-radius:.5rem;border:none;cursor:pointer;font-size:.75rem;
font-weight:600;color:#fff;transition:.2s;opacity:.4}
.att-btn.selected{opacity:1;transform:scale(1.1);box-shadow:0 2px 8px rgba(0,0,0,.2)}
.menu-toggle{display:none;background:none;border:none;color:var(--tx);cursor:pointer;font-size:1.25rem;padding:.5rem}
@media(max-width:1024px){.menu-toggle{display:block}}
.doc-preview{border:2px dashed var(--bd);border-radius:1rem;padding:2rem;text-align:center;margin:1rem 0}
</style>
</head>
<body>
<!-- Login Page -->
<div id="loginPage" class="login-wrap">
<div class="login-card">
<div class="login-logo">🛡️</div>
<h2 class="text-center font-bold text-xl mb-1">سامانه انضباطی و ارزشیابی</h2>
<p class="text-center text-sm" style="color:var(--tx2)">هنرستان فنی و حرفه‌ای</p>
<div class="role-grid" id="roleGrid">
<button class="role-btn" data-role="admin" onclick="selectRole('admin')">🛡️ مدیر</button>
<button class="role-btn" data-role="teacher" onclick="selectRole('teacher')">📖 دبیر</button>
<button class="role-btn" data-role="counselor" onclick="selectRole('counselor')">🧭 مشاور</button>
<button class="role-btn" data-role="parent" onclick="selectRole('parent')">👨‍👩‍👦 ولی</button>
<button class="role-btn" data-role="student" onclick="selectRole('student')">🎓 دانش‌آموز</button>
</div>
<div id="loginForm" class="hidden">
<input class="input" id="loginNid" placeholder="کد ملی" dir="ltr">
<input class="input" id="loginPass" type="password" placeholder="رمز عبور">
<p id="loginError" class="text-red text-xs text-center mb-2 hidden"></p>
<button class="btn btn-primary w-full" onclick="doLogin()" style="justify-content:center">ورود به سامانه</button>
<div class="text-center mt-4">
<p class="text-xs" style="color:var(--tx3)">ورود سریع (نسخه نمایشی):</p>
<div class="flex gap-1 mt-2" style="justify-content:center;flex-wrap:wrap">
<button class="btn btn-outline btn-sm" onclick="quickLogin('admin')">مدیر</button>
<button class="btn btn-outline btn-sm" onclick="quickLogin('teacher')">دبیر</button>
<button class="btn btn-outline btn-sm" onclick="quickLogin('counselor')">مشاور</button>
<button class="btn btn-outline btn-sm" onclick="quickLogin('parent')">ولی</button>
<button class="btn btn-outline btn-sm" onclick="quickLogin('student')">دانش‌آموز</button>
</div>
</div>
</div>
</div>
</div>

<!-- Main App -->
<div id="appPage" class="app hidden">
<aside class="sidebar" id="sidebar">
<div style="padding:1.25rem;border-bottom:1px solid var(--bd)">
<div class="flex items-center gap-3">
<div class="avatar">🛡️</div>
<div><div class="font-bold text-sm">سامانه انضباطی</div><div class="text-xs" style="color:var(--tx2)">هنرستان فنی</div></div>
</div>
</div>
<nav style="flex:1;padding:.75rem;overflow-y:auto" id="navMenu"></nav>
<div style="padding:1rem;border-top:1px solid var(--bd)">
<div class="flex items-center gap-3" style="padding:.75rem;background:var(--bg3);border-radius:.75rem">
<div class="avatar" id="userAvatar">م</div>
<div style="flex:1;min-width:0">
<div class="text-sm font-medium" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap" id="userName">کاربر</div>
<span class="badge badge-green text-xs" id="userRole">مدیر</span>
</div>
</div>
</div>
</aside>
<div class="main">
<header class="header">
<div class="flex items-center gap-3" style="flex:1">
<button class="menu-toggle" onclick="toggleSidebar()">☰</button>
<h1 class="page-title" id="pageTitle">داشبورد</h1>
</div>
<div class="flex items-center gap-2">
<button class="btn btn-outline btn-sm" onclick="toggleDark()" id="darkBtn">🌙</button>
<button class="btn btn-outline btn-sm" onclick="doLogout()">🚪 خروج</button>
</div>
</header>
<div class="content" id="pageContent"></div>
</div>
</div>

<div class="toast-container" id="toasts"></div>
<div id="modalWrap"></div>

<script>
// ═══════════════════════════════════════════
// State & Config
// ═══════════════════════════════════════════
const S = {
  user: null, page: 'dashboard', dark: localStorage.getItem('dark')==='1',
  students: [], discipline: [], grades: [], attendance: [], announcements: [],
};
const ROLES = {admin:'مدیر',teacher:'دبیر',counselor:'مشاور',parent:'ولی',student:'دانش‌آموز'};
const ROLE_ICONS = {admin:'🛡️',teacher:'📖',counselor:'🧭',parent:'👨‍👩‍👦',student:'🎓'};
const NAV = [
  {id:'dashboard',label:'داشبورد',icon:'📊',roles:['admin','teacher','counselor','parent','student']},
  {id:'students',label:'دانش‌آموزان',icon:'👥',roles:['admin','teacher','counselor']},
  {id:'attendance',label:'حضور و غیاب',icon:'✅',roles:['admin','teacher']},
  {id:'discipline',label:'انضباط',icon:'⚠️',roles:['admin','teacher','counselor','student','parent']},
  {id:'grading',label:'ارزشیابی و نمرات',icon:'🏆',roles:['admin','teacher','student','parent']},
  {id:'reports',label:'گزارش‌ها',icon:'📈',roles:['admin','teacher','counselor']},
  {id:'announcements',label:'اطلاعیه‌ها',icon:'📢',roles:['admin','teacher','counselor','parent','student']},
  {id:'documents',label:'اسناد و کارنامه',icon:'📄',roles:['admin','teacher','student','parent']},
  {id:'settings',label:'تنظیمات',icon:'⚙️',roles:['admin']},
];

// ═══════════════════════════════════════════
// API Client
// ═══════════════════════════════════════════
async function api(url, method='GET', data=null) {
  const opts = {method, headers:{'Content-Type':'application/json'}};
  if (data) opts.body = JSON.stringify(data);
  const r = await fetch(url, opts);
  if (r.status===401){showLogin();return null;}
  return r.json();
}

// ═══════════════════════════════════════════
// Auth
// ═══════════════════════════════════════════
let selectedRole = null;
function selectRole(role) {
  selectedRole = role;
  document.querySelectorAll('.role-btn').forEach(b=>b.classList.toggle('active',b.dataset.role===role));
  document.getElementById('loginForm').classList.remove('hidden');
}
async function doLogin() {
  const nid = document.getElementById('loginNid').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  if (!nid) { showLoginError('لطفاً کد ملی را وارد کنید'); return; }
  const r = await api('/api/login','POST',{national_id:nid,password:pass,role:selectedRole||'admin'});
  if (r && r.ok) { S.user=r.user; showApp(); }
  else showLoginError(r?.error||'خطا در ورود');
}
async function quickLogin(role) {
  const r = await api('/api/login','POST',{national_id:'0000000001',password:'admin',role});
  if (r && r.ok) { S.user=r.user; showApp(); }
}
function showLoginError(msg) {
  const el=document.getElementById('loginError');
  el.textContent=msg;el.classList.remove('hidden');
}
async function doLogout() {
  await api('/api/logout');S.user=null;showLogin();
}
function showLogin() {
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('appPage').classList.add('hidden');
}
function showApp() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('appPage').classList.remove('hidden');
  document.getElementById('userName').textContent=S.user.name;
  document.getElementById('userRole').textContent=ROLES[S.user.role];
  document.getElementById('userAvatar').textContent=S.user.name.charAt(0);
  buildNav();navigate('dashboard');
}

// ═══════════════════════════════════════════
// Navigation
// ═══════════════════════════════════════════
function buildNav() {
  const nav=document.getElementById('navMenu');
  nav.innerHTML=NAV.filter(n=>n.roles.includes(S.user.role)).map(n=>
    `<div class="nav-item${S.page===n.id?' active':''}" onclick="navigate('${n.id}')">
      <span>${n.icon}</span><span>${n.label}</span></div>`
  ).join('');
}
function navigate(page) {
  S.page=page;buildNav();
  document.getElementById('pageTitle').textContent=NAV.find(n=>n.id===page)?.label||'';
  const pages={dashboard:renderDashboard,students:renderStudents,attendance:renderAttendance,
    discipline:renderDiscipline,grading:renderGrading,reports:renderReports,
    announcements:renderAnnouncements,documents:renderDocuments,settings:renderSettings};
  (pages[page]||renderDashboard)();
  // Close sidebar on mobile
  document.getElementById('sidebar').classList.remove('show');
}
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('show')}
function toggleDark(){
  S.dark=!S.dark;document.documentElement.classList.toggle('dark',S.dark);
  localStorage.setItem('dark',S.dark?'1':'0');
  document.getElementById('darkBtn').textContent=S.dark?'☀️':'🌙';
}

// ═══════════════════════════════════════════
// Utilities
// ═══════════════════════════════════════════
function toast(msg,type='success'){
  const d=document.createElement('div');d.className=`toast toast-${type}`;d.textContent=msg;
  document.getElementById('toasts').appendChild(d);setTimeout(()=>d.remove(),3000);
}
function showModal(html){
  document.getElementById('modalWrap').innerHTML=
    `<div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal">${html}</div></div>`;
}
function closeModal(){document.getElementById('modalWrap').innerHTML='';}
function scoreColor(s){return s>=85?'text-green':s>=70?'text-blue':s>=55?'text-amber':'text-red'}
function gpaColor(g){return g>=17?'text-green':g>=14?'text-blue':g>=10?'text-amber':'text-red'}
function progressBar(pct,color){
  return `<div class="progress"><div class="progress-bar" style="width:${pct}%;background:${color}"></div></div>`;
}

// ═══════════════════════════════════════════
// Dashboard
// ═══════════════════════════════════════════
async function renderDashboard(){
  const c=document.getElementById('pageContent');
  const d=await api('/api/dashboard');
  if(!d){c.innerHTML='<div class="empty-state">خطا در بارگذاری</div>';return;}
  const role=S.user.role;
  c.innerHTML=`
  <div class="welcome-banner">
    <h2 class="text-xl font-bold mb-1">خوش آمدید، ${S.user.name} 👋</h2>
    <p style="opacity:.9">
      ${role==='admin'?'مدیریت کامل سامانه انضباطی و ارزشیابی':
        role==='teacher'?'ثبت و بررسی نمرات و انضباط دانش‌آموزان':
        role==='counselor'?'پیگیری وضعیت تحصیلی و انضباطی':
        role==='parent'?'مشاهده وضعیت فرزندتان':
        'مشاهده نمرات و وضعیت انضباطی'}
    </p>
    <div class="flex gap-3 mt-4" style="flex-wrap:wrap">
      <span style="background:rgba(255,255,255,.2);padding:.25rem .75rem;border-radius:2rem;font-size:.8rem">📅 ۱۴۰۴/۰۳/۱۶</span>
      <span style="background:rgba(255,255,255,.2);padding:.25rem .75rem;border-radius:2rem;font-size:.8rem">🕐 ${new Date().toLocaleTimeString('fa-IR')}</span>
    </div>
  </div>
  <div class="grid grid-4 mb-4">
    <div class="card stat-card">
      <div><div class="stat-label">کل دانش‌آموزان</div><div class="stat-value">${d.totalStudents}</div></div>
      <div class="stat-icon" style="background:linear-gradient(135deg,#3b82f6,#06b6d4)">👥</div>
    </div>
    <div class="card stat-card">
      <div><div class="stat-label">میانگین انضباط</div><div class="stat-value">${d.avgDiscipline}</div></div>
      <div class="stat-icon" style="background:linear-gradient(135deg,#f59e0b,#f97316)">⚠️</div>
    </div>
    <div class="card stat-card">
      <div><div class="stat-label">میانگین نمرات</div><div class="stat-value">${d.avgAcademic}</div></div>
      <div class="stat-icon" style="background:linear-gradient(135deg,#10b981,#22c55e)">🏆</div>
    </div>
    <div class="card stat-card">
      <div><div class="stat-label">نرخ حضور</div><div class="stat-value">${d.avgAttendance}%</div></div>
      <div class="stat-icon" style="background:linear-gradient(135deg,#8b5cf6,#6366f1)">🕐</div>
    </div>
  </div>
  <div class="grid grid-3 mb-4">
    <div class="card">
      <h3 class="font-bold mb-3">⚠️ خلاصه انضباطی</h3>
      <div class="flex items-center justify-between mb-2" style="padding:.75rem;background:var(--pr4);border-radius:.75rem">
        <span class="text-sm">✅ سوابق مثبت</span><span class="font-bold text-green">${d.positiveCount}</span>
      </div>
      <div class="flex items-center justify-between mb-3" style="padding:.75rem;background:var(--dn3);border-radius:.75rem">
        <span class="text-sm">❌ سوابق منفی</span><span class="font-bold text-red">${d.negativeCount}</span>
      </div>
      <div class="text-xs mb-1 flex justify-between" style="color:var(--tx2)">
        <span>نسبت مثبت به منفی</span><span>${Math.round(d.positiveCount/(d.positiveCount+d.negativeCount)*100)}%</span>
      </div>
      ${progressBar(Math.round(d.positiveCount/(d.positiveCount+d.negativeCount)*100),'var(--pr)')}
    </div>
    <div class="card">
      <h3 class="font-bold mb-3">🏆 برترین دانش‌آموزان</h3>
      ${d.topStudents.map((s,i)=>`
        <div class="flex items-center gap-3 mb-2" style="padding:.4rem;border-radius:.5rem">
          <div style="width:2rem;height:2rem;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;
            background:${i===0?'#fef3c7':i===1?'#e2e8f0':i===2?'#fed7aa':'#f1f5f9'};color:${i===0?'#92400e':i===1?'#475569':'#9a3412'}">${i+1}</div>
          <div style="flex:1;min-width:0"><div class="text-sm font-medium" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.name}</div>
          <div class="text-xs" style="color:var(--tx3)">${s.field}</div></div>
          <span class="font-bold text-green">${s.score}</span>
        </div>`).join('')}
    </div>
    <div class="card">
      <h3 class="font-bold mb-3">📉 در معرض خطر</h3>
      ${d.atRisk.length?d.atRisk.map(s=>`
        <div style="padding:.75rem;background:var(--dn3);border-radius:.75rem;margin-bottom:.5rem;border:1px solid rgba(239,68,68,.2)">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium">${s.name}</span>
            <span class="badge badge-red">نیاز به پیگیری</span>
          </div>
          <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:.35rem">
            <div class="text-center" style="padding:.35rem;background:var(--bg2);border-radius:.5rem">
              <div class="text-sm font-bold text-red">${s.discipline_score}</div><div class="text-xs" style="color:var(--tx3)">انضباط</div>
            </div>
            <div class="text-center" style="padding:.35rem;background:var(--bg2);border-radius:.5rem">
              <div class="text-sm font-bold text-amber">${s.attendance_rate}%</div><div class="text-xs" style="color:var(--tx3)">حضور</div>
            </div>
            <div class="text-center" style="padding:.35rem;background:var(--bg2);border-radius:.5rem">
              <div class="text-sm font-bold text-blue">${s.gpa||'-'}</div><div class="text-xs" style="color:var(--tx3)">معدل</div>
            </div>
          </div>
        </div>`).join(''):'<div class="empty-state text-sm">موردی یافت نشد ✅</div>'}
    </div>
  </div>
  <div class="card">
    <h3 class="font-bold mb-3">📢 آخرین اطلاعیه‌ها</h3>
    ${d.announcements.map(a=>{
      const colors={urgent:'border-right:4px solid var(--dn);background:var(--dn3)',
        warning:'border-right:4px solid var(--wn);background:var(--wn3)',
        success:'border-right:4px solid var(--pr);background:var(--pr4)',
        info:'border-right:4px solid var(--bl);background:var(--bl3)'};
      return `<div style="padding:.75rem;border-radius:.75rem;margin-bottom:.5rem;${colors[a.type]||colors.info}">
        <div class="flex items-center gap-2 mb-1">${a.pinned?'📌':''}<span class="font-medium text-sm">${a.title}</span></div>
        <p class="text-xs" style="color:var(--tx2)">${a.content}</p>
        <span class="text-xs" style="color:var(--tx3)">${a.date}</span>
      </div>`;
    }).join('')}
  </div>`;
}

// ═══════════════════════════════════════════
// Students
// ═══════════════════════════════════════════
async function renderStudents(){
  const c=document.getElementById('pageContent');
  const data=await api('/api/students');
  if(!data)return;
  S.students=data;
  c.innerHTML=`
  <div class="flex justify-between items-center mb-4" style="flex-wrap:wrap;gap:.5rem">
    <div><div class="page-title">مدیریت دانش‌آموزان</div><div class="page-desc">${data.length} دانش‌آموز</div></div>
    ${S.user.role==='admin'?`<button class="btn btn-primary" onclick="showAddStudent()">➕ افزودن</button>`:''}
  </div>
  <div class="filter-bar">
    <input class="input" style="flex:1;margin:0" placeholder="جستجو با نام یا کد ملی..." id="studentSearch" oninput="filterStudents()">
    <select class="input" style="width:auto;margin:0" id="fieldFilter" onchange="filterStudents()">
      <option value="">همه رشته‌ها</option>
      ${[...new Set(data.map(s=>s.field))].map(f=>`<option value="${f}">${f}</option>`).join('')}
    </select>
  </div>
  <div class="grid grid-3" id="studentsGrid">
    ${data.map(s=>studentCard(s)).join('')}
  </div>`;
}
function studentCard(s){
  return `<div class="card" style="cursor:pointer" onclick="showStudentDetail(${s.id})">
    <div class="flex items-center gap-3 mb-3">
      <div class="avatar">${s.name.charAt(0)}</div>
      <div style="flex:1;min-width:0">
        <div class="font-bold text-sm">${s.name}</div>
        <div class="text-xs" style="color:var(--tx2)">${s.field} - ${s.class_name}</div>
      </div>
    </div>
    <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:.35rem">
      <div class="text-center" style="padding:.5rem;background:var(--bg3);border-radius:.5rem">
        <div class="font-bold ${scoreColor(s.discipline_score)}">${s.discipline_score}</div>
        <div class="text-xs" style="color:var(--tx3)">انضباط</div>
      </div>
      <div class="text-center" style="padding:.5rem;background:var(--bg3);border-radius:.5rem">
        <div class="font-bold ${gpaColor(s.gpa||0)}">${s.gpa||'-'}</div>
        <div class="text-xs" style="color:var(--tx3)">معدل</div>
      </div>
      <div class="text-center" style="padding:.5rem;background:var(--bg3);border-radius:.5rem">
        <div class="font-bold text-blue">${s.attendance_rate}%</div>
        <div class="text-xs" style="color:var(--tx3)">حضور</div>
      </div>
    </div>
    <div class="mt-2">
      <div class="flex justify-between text-xs mb-1" style="color:var(--tx3)"><span>نرخ حضور</span><span>${s.attendance_rate}%</span></div>
      ${progressBar(s.attendance_rate, s.attendance_rate>=95?'var(--pr)':s.attendance_rate>=85?'var(--bl)':s.attendance_rate>=75?'var(--wn)':'var(--dn)')}
    </div>
  </div>`;
}
function filterStudents(){
  const q=document.getElementById('studentSearch').value.toLowerCase();
  const f=document.getElementById('fieldFilter').value;
  const filtered=S.students.filter(s=>(!q||s.name.includes(q)||s.national_id.includes(q))&&(!f||s.field===f));
  document.getElementById('studentsGrid').innerHTML=filtered.map(s=>studentCard(s)).join('')||
    '<div class="empty-state" style="grid-column:1/-1"><div class="icon">🔍</div><p>موردی یافت نشد</p></div>';
}
async function showStudentDetail(id){
  const s=await api(`/api/students/${id}`);
  if(!s)return;
  showModal(`
    <div class="flex items-center gap-4 mb-4" style="padding-bottom:1rem;border-bottom:1px solid var(--bd)">
      <div class="avatar avatar-lg">${s.name.charAt(0)}</div>
      <div style="flex:1"><div class="text-lg font-bold">${s.name}</div>
      <div class="text-sm" style="color:var(--tx2)">${s.field} - ${s.grade} - ${s.class_name}</div>
      <div class="text-xs" style="color:var(--tx3)" dir="ltr">کد ملی: ${s.national_id}</div></div>
      <button class="btn btn-outline btn-sm" onclick="closeModal()">✕</button>
    </div>
    <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:.75rem;margin-bottom:1rem">
      <div class="text-center" style="padding:1rem;background:var(--pr4);border-radius:.75rem">
        <div class="text-2xl font-bold ${scoreColor(s.discipline_score)}">${s.discipline_score}</div>
        <div class="text-xs" style="color:var(--tx2)">امتیاز انضباطی</div>
      </div>
      <div class="text-center" style="padding:1rem;background:var(--bl3);border-radius:.75rem">
        <div class="text-2xl font-bold text-blue">${s.gpa||'-'}</div>
        <div class="text-xs" style="color:var(--tx2)">معدل</div>
      </div>
      <div class="text-center" style="padding:1rem;background:var(--pp3);border-radius:.75rem">
        <div class="text-2xl font-bold" style="color:var(--pp)">${s.attendance_rate}%</div>
        <div class="text-xs" style="color:var(--tx2)">نرخ حضور</div>
      </div>
    </div>
    <div class="grid grid-2 gap-3">
      <div style="padding:.75rem;background:var(--bg3);border-radius:.75rem">
        <div class="text-xs" style="color:var(--tx3)">تلفن دانش‌آموز</div>
        <div class="text-sm font-medium" dir="ltr">${s.phone}</div>
      </div>
      <div style="padding:.75rem;background:var(--bg3);border-radius:.75rem">
        <div class="text-xs" style="color:var(--tx3)">تلفن ولی</div>
        <div class="text-sm font-medium" dir="ltr">${s.parent_phone}</div>
      </div>
    </div>`);
}
function showAddStudent(){
  showModal(`
    <h3 class="font-bold text-lg mb-4">➕ افزودن دانش‌آموز جدید</h3>
    <div class="form-group"><label class="form-label">نام</label><input class="input" id="nsName"></div>
    <div class="form-group"><label class="form-label">کد ملی</label><input class="input" id="nsNid" dir="ltr"></div>
    <div class="grid grid-2 gap-3">
      <div class="form-group"><label class="form-label">رشته</label>
        <select class="input" id="nsField"><option>کامپیوتر</option><option>برق</option><option>مکانیک</option></select></div>
      <div class="form-group"><label class="form-label">پایه</label>
        <select class="input" id="nsGrade"><option>دهم</option><option>یازدهم</option><option>دوازدهم</option></select></div>
    </div>
    <div class="form-group"><label class="form-label">کلاس</label><input class="input" id="nsClass"></div>
    <div class="grid grid-2 gap-3">
      <div class="form-group"><label class="form-label">تلفن</label><input class="input" id="nsPhone" dir="ltr"></div>
      <div class="form-group"><label class="form-label">تلفن ولی</label><input class="input" id="nsParent" dir="ltr"></div>
    </div>
    <div class="flex gap-3 mt-4">
      <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="saveStudent()">ذخیره</button>
      <button class="btn btn-outline" style="flex:1;justify-content:center" onclick="closeModal()">انصراف</button>
    </div>`);
}
async function saveStudent(){
  const data={name:nsName.value,national_id:nsNid.value,field:nsField.value,
    grade:nsGrade.value,class_name:nsClass.value,phone:nsPhone.value,parent_phone:nsParent.value};
  if(!data.name||!data.national_id){toast('نام و کد ملی الزامی است','error');return;}
  const r=await api('/api/students','POST',data);
  if(r?.ok){toast('دانش‌آموز اضافه شد');closeModal();renderStudents();}
  else toast(r?.error||'خطا','error');
}

// ═══════════════════════════════════════════
// Attendance
// ═══════════════════════════════════════════
let attData={};
async function renderAttendance(){
  const c=document.getElementById('pageContent');
  const data=await api('/api/students');
  attData={};
  c.innerHTML=`
  <div class="flex justify-between items-center mb-4" style="flex-wrap:wrap;gap:.5rem">
    <div><div class="page-title">حضور و غیاب</div><div class="page-desc">ثبت حضور روزانه</div></div>
    <select class="input" style="width:auto;margin:0" id="attClass" onchange="filterAttClass()">
      <option value="">همه کلاس‌ها</option>
      ${[...new Set(data.map(s=>s.class_name))].map(c=>`<option>${c}</option>`).join('')}
    </select>
  </div>
  <div class="grid grid-4 mb-4" id="attStats">
    <div class="card text-center" style="background:var(--pr4)"><div class="text-2xl font-bold text-green" id="attPresent">0</div><div class="text-xs">حاضر ✅</div></div>
    <div class="card text-center" style="background:var(--dn3)"><div class="text-2xl font-bold text-red" id="attAbsent">0</div><div class="text-xs">غایب ❌</div></div>
    <div class="card text-center" style="background:var(--wn3)"><div class="text-2xl font-bold text-amber" id="attLate">0</div><div class="text-xs">تأخیر 🕐</div></div>
    <div class="card text-center" style="background:var(--bl3)"><div class="text-2xl font-bold text-blue" id="attExcused">0</div><div class="text-xs">موجه 📋</div></div>
  </div>
  <div class="flex gap-2 mb-4">
    <button class="btn btn-outline btn-sm" onclick="markAllPresent()">✅ همه حاضر</button>
    <button class="btn btn-primary btn-sm" onclick="saveAttendance()">💾 ذخیره</button>
  </div>
  <div class="tbl-wrap">
    <table><thead><tr><th>ردیف</th><th>دانش‌آموز</th><th>کلاس</th><th style="text-align:center">وضعیت</th></tr></thead>
    <tbody id="attBody">
    ${data.map((s,i)=>`<tr data-class="${s.class_name}" data-id="${s.id}">
      <td>${i+1}</td><td><div class="flex items-center gap-2"><div class="avatar" style="width:2rem;height:2rem;font-size:.75rem">${s.name.charAt(0)}</div>${s.name}</div></td>
      <td class="text-sm" style="color:var(--tx2)">${s.class_name}</td>
      <td style="text-align:center">
        <div class="flex gap-1" style="justify-content:center">
          <button class="att-btn" style="background:var(--pr)" onclick="setAtt(${s.id},'present',this)">حاضر</button>
          <button class="att-btn" style="background:var(--dn)" onclick="setAtt(${s.id},'absent',this)">غایب</button>
          <button class="att-btn" style="background:var(--wn)" onclick="setAtt(${s.id},'late',this)">تأخیر</button>
          <button class="att-btn" style="background:var(--bl)" onclick="setAtt(${s.id},'excused',this)">موجه</button>
        </div>
      </td></tr>`).join('')}
    </tbody></table>
  </div>`;
}
function setAtt(id,status,btn){
  attData[id]=status;
  btn.parentElement.querySelectorAll('.att-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  updateAttStats();
}
function markAllPresent(){
  document.querySelectorAll('#attBody tr').forEach(tr=>{
    const id=parseInt(tr.dataset.id);attData[id]='present';
    tr.querySelectorAll('.att-btn').forEach((b,i)=>b.classList.toggle('selected',i===0));
  });
  updateAttStats();
}
function updateAttStats(){
  const v=Object.values(attData);
  document.getElementById('attPresent').textContent=v.filter(x=>x==='present').length;
  document.getElementById('attAbsent').textContent=v.filter(x=>x==='absent').length;
  document.getElementById('attLate').textContent=v.filter(x=>x==='late').length;
  document.getElementById('attExcused').textContent=v.filter(x=>x==='excused').length;
}
function filterAttClass(){
  const f=document.getElementById('attClass').value;
  document.querySelectorAll('#attBody tr').forEach(tr=>{
    tr.style.display=!f||tr.dataset.class===f?'':'none';
  });
}
async function saveAttendance(){
  if(!Object.keys(attData).length){toast('لطفاً وضعیت را مشخص کنید','error');return;}
  const r=await api('/api/attendance','POST',{records:attData,date:'1404/03/16'});
  if(r?.ok)toast('حضور و غیاب ذخیره شد');else toast('خطا در ذخیره','error');
}

// ═══════════════════════════════════════════
// Discipline
// ═══════════════════════════════════════════
async function renderDiscipline(){
  const c=document.getElementById('pageContent');
  const data=await api('/api/discipline');
  S.discipline=data;
  const pos=data.filter(r=>r.type==='positive').length;
  const neg=data.filter(r=>r.type==='negative').length;
  const appeal=data.filter(r=>r.status==='appealed').length;
  c.innerHTML=`
  <div class="flex justify-between items-center mb-4" style="flex-wrap:wrap;gap:.5rem">
    <div><div class="page-title">مدیریت انضباطی</div><div class="page-desc">ثبت و پیگیری سوابق</div></div>
    ${['admin','teacher'].includes(S.user.role)?`<button class="btn btn-primary" onclick="showAddDiscipline()">➕ ثبت مورد</button>`:''}
  </div>
  <div class="grid grid-3 mb-4">
    <div class="card flex items-center gap-3"><div class="stat-icon" style="background:var(--pr3);color:var(--pr2)">✅</div><div><div class="text-xl font-bold text-green">${pos}</div><div class="text-xs" style="color:var(--tx2)">مثبت</div></div></div>
    <div class="card flex items-center gap-3"><div class="stat-icon" style="background:var(--dn3);color:var(--dn)">❌</div><div><div class="text-xl font-bold text-red">${neg}</div><div class="text-xs" style="color:var(--tx2)">منفی</div></div></div>
    <div class="card flex items-center gap-3"><div class="stat-icon" style="background:var(--wn3);color:var(--wn)">⏳</div><div><div class="text-xl font-bold text-amber">${appeal}</div><div class="text-xs" style="color:var(--tx2)">در انتظار</div></div></div>
  </div>
  <div class="filter-bar">
    <input class="input" style="flex:1;margin:0" placeholder="جستجو..." id="discSearch" oninput="filterDisc()">
    <div class="flex gap-2">
      <button class="tab-btn active" onclick="filterDiscType('all',this)">همه</button>
      <button class="tab-btn" onclick="filterDiscType('positive',this)">مثبت</button>
      <button class="tab-btn" onclick="filterDiscType('negative',this)">منفی</button>
    </div>
  </div>
  <div class="tbl-wrap"><table><thead><tr>
    <th>دانش‌آموز</th><th>نوع</th><th>دسته</th><th>توضیحات</th><th>امتیاز</th><th>تاریخ</th><th>وضعیت</th>
  </tr></thead><tbody id="discBody">
  ${data.map(r=>`<tr data-type="${r.type}">
    <td class="font-medium text-sm">${r.student_name}</td>
    <td>${r.type==='positive'?'<span class="badge badge-green">✅ مثبت</span>':'<span class="badge badge-red">❌ منفی</span>'}</td>
    <td class="text-sm">${r.category}</td>
    <td class="text-sm" style="color:var(--tx2);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.description}</td>
    <td class="font-bold ${r.points>0?'text-green':'text-red'}">${r.points>0?'+':''}${r.points}</td>
    <td class="text-sm" style="color:var(--tx3)">${r.date}</td>
    <td>${r.status==='active'?'<span class="badge badge-green">فعال</span>':r.status==='appealed'?'<span class="badge badge-amber">تجدیدنظر</span>':'<span class="badge badge-blue">حل‌شده</span>'}</td>
  </tr>`).join('')}
  </tbody></table></div>`;
}
let discFilter='all';
function filterDiscType(type,btn){
  discFilter=type;
  btn.parentElement.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');filterDisc();
}
function filterDisc(){
  const q=(document.getElementById('discSearch')?.value||'').toLowerCase();
  document.querySelectorAll('#discBody tr').forEach(tr=>{
    const match=(!q||tr.textContent.toLowerCase().includes(q))&&(discFilter==='all'||tr.dataset.type===discFilter);
    tr.style.display=match?'':'none';
  });
}
function showAddDiscipline(){
  showModal(`
    <h3 class="font-bold text-lg mb-4">⚠️ ثبت مورد انضباطی</h3>
    <div class="form-group"><label class="form-label">نوع</label>
      <div class="grid grid-2 gap-2">
        <button class="btn btn-outline" id="dtypePos" onclick="setDiscType('positive')" style="justify-content:center;border-color:var(--pr)">✅ مثبت</button>
        <button class="btn btn-outline" id="dtypeNeg" onclick="setDiscType('negative')" style="justify-content:center">❌ منفی</button>
      </div></div>
    <input type="hidden" id="dType" value="positive">
    <div class="form-group"><label class="form-label">دانش‌آموز</label>
      <select class="input" id="dStudent">${S.students.map(s=>`<option value="${s.id}">${s.name} - ${s.class_name}</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">دسته‌بندی</label>
      <select class="input" id="dCategory">
        <option>نظم و انضباط</option><option>فعالیت کلاسی</option><option>مسابقه</option>
        <option>کمک به دیگران</option><option>نمره</option><option>غیبت</option>
        <option>تأخیر</option><option>رفتار نامناسب</option><option>استفاده غیرمجاز</option>
      </select></div>
    <div class="form-group"><label class="form-label">توضیحات</label>
      <textarea class="input" id="dDesc" placeholder="توضیح مورد..."></textarea></div>
    <div class="form-group"><label class="form-label">امتیاز</label>
      <input class="input" type="number" id="dPoints" value="5" min="1" max="20"></div>
    <div class="flex gap-3 mt-4">
      <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="saveDiscipline()">ثبت</button>
      <button class="btn btn-outline" style="flex:1;justify-content:center" onclick="closeModal()">انصراف</button>
    </div>`);
}
function setDiscType(t){
  document.getElementById('dType').value=t;
  document.getElementById('dtypePos').style.borderColor=t==='positive'?'var(--pr)':'var(--bd)';
  document.getElementById('dtypeNeg').style.borderColor=t==='negative'?'var(--dn)':'var(--bd)';
}
async function saveDiscipline(){
  const data={student_id:parseInt(dStudent.value),type:dType.value,category:dCategory.value,
    description:dDesc.value,points:dType.value==='positive'?Math.abs(parseInt(dPoints.value)):-Math.abs(parseInt(dPoints.value))};
  if(!data.description){toast('توضیحات الزامی است','error');return;}
  const r=await api('/api/discipline','POST',data);
  if(r?.ok){toast('ثبت شد');closeModal();renderDiscipline();}else toast(r?.error||'خطا','error');
}

// ═══════════════════════════════════════════
// Grading
// ═══════════════════════════════════════════
async function renderGrading(){
  const c=document.getElementById('pageContent');
  const data=await api('/api/grades');
  S.grades=data;
  if(S.user.role==='student'||S.user.role==='parent'){
    const myGrades=data.filter(g=>g.student_id===1);
    const subjects=[...new Set(myGrades.map(g=>g.subject))];
    const gpa=myGrades.length?myGrades.reduce((a,g)=>a+(g.score/g.max_score)*20*(g.weight/100),0)/
      myGrades.reduce((a,g)=>a+g.weight/100,0):0;
    c.innerHTML=`
    <div class="card mb-4">
      <div class="flex items-center gap-4 mb-4">
        <div class="avatar avatar-lg">ع</div>
        <div style="flex:1"><div class="text-lg font-bold">علی احمدی</div><div class="text-sm" style="color:var(--tx2)">کامپیوتر - یازدهم</div></div>
        <div class="text-center"><div class="text-3xl font-bold text-green">${gpa.toFixed(1)}</div><div class="text-xs" style="color:var(--tx2)">معدل وزنی</div></div>
      </div>
      <h3 class="font-bold mb-3">عملکرد به تفکیک درس</h3>
      <div class="grid grid-3 gap-3">
        ${subjects.map(sub=>{
          const sg=myGrades.filter(g=>g.subject===sub);
          const avg=sg.reduce((a,g)=>a+(g.score/g.max_score)*20,0)/sg.length;
          return `<div style="padding:1rem;background:var(--bg3);border-radius:.75rem">
            <div class="flex justify-between items-center mb-2"><span class="text-sm font-medium">${sub}</span>
            <span class="font-bold ${gpaColor(avg)}">${avg.toFixed(1)}</span></div>
            ${progressBar((avg/20)*100,avg>=17?'var(--pr)':avg>=14?'var(--bl)':avg>=10?'var(--wn)':'var(--dn)')}
          </div>`;
        }).join('')}
      </div>
    </div>
    <div class="card">
      <h3 class="font-bold mb-3">جزئیات نمرات</h3>
      ${myGrades.map(g=>`<div class="flex items-center justify-between" style="padding:.75rem;background:var(--bg3);border-radius:.75rem;margin-bottom:.5rem">
        <div class="flex items-center gap-3">
          <div style="width:3.5rem;height:3.5rem;border-radius:.75rem;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;
            background:${g.score/g.max_score>=.85?'var(--pr4)':g.score/g.max_score>=.7?'var(--bl3)':g.score/g.max_score>=.5?'var(--wn3)':'var(--dn3)'};
            color:${g.score/g.max_score>=.85?'var(--pr2)':g.score/g.max_score>=.7?'var(--bl)':g.score/g.max_score>=.5?'var(--wn)':'var(--dn)'}">${g.score}</div>
          <div><div class="text-sm font-medium">${g.subject}</div>
          <div class="text-xs" style="color:var(--tx3)">${g.grade_type==='quiz'?'کوییز':g.grade_type==='midterm'?'میان‌ترم':g.grade_type==='practical'?'عملی':g.grade_type} | وزن: ${g.weight}%</div></div>
        </div><span class="text-sm" style="color:var(--tx3)">از ${g.max_score}</span>
      </div>`).join('')}
    </div>`;
    return;
  }
  const subjects=[...new Set(data.map(g=>g.subject))];
  c.innerHTML=`
  <div class="flex justify-between items-center mb-4" style="flex-wrap:wrap;gap:.5rem">
    <div><div class="page-title">ارزشیابی و نمرات</div><div class="page-desc">ثبت نمرات با سیستم وزن‌دهی</div></div>
    ${['admin','teacher'].includes(S.user.role)?`<button class="btn btn-primary" onclick="showAddGrade()">➕ ثبت نمره</button>`:''}
  </div>
  <div class="filter-bar">
    <select class="input" style="margin:0" id="gradeStudent" onchange="filterGrades()">
      <option value="">همه دانش‌آموزان</option>
      ${S.students.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}
    </select>
    <select class="input" style="margin:0" id="gradeSubject" onchange="filterGrades()">
      <option value="">همه دروس</option>
      ${subjects.map(s=>`<option>${s}</option>`).join('')}
    </select>
  </div>
  <div class="tbl-wrap"><table><thead><tr>
    <th>دانش‌آموز</th><th>درس</th><th>نوع</th><th>نمره</th><th>وزن</th><th>تاریخ</th>
  </tr></thead><tbody id="gradeBody">
  ${data.map(g=>`<tr data-sid="${g.student_id}" data-sub="${g.subject}">
    <td class="font-medium text-sm">${g.student_name}</td>
    <td class="text-sm">${g.subject}</td>
    <td><span class="badge badge-blue">${g.grade_type==='quiz'?'کوییز':g.grade_type==='midterm'?'میان‌ترم':g.grade_type==='practical'?'عملی':g.grade_type==='homework'?'تکلیف':g.grade_type}</span></td>
    <td><span style="display:inline-flex;align-items:center;justify-content:center;width:3rem;height:2rem;border-radius:.5rem;font-weight:700;font-size:.85rem;
      background:${g.score/g.max_score>=.85?'var(--pr4)':g.score/g.max_score>=.7?'var(--bl3)':g.score/g.max_score>=.5?'var(--wn3)':'var(--dn3)'};
      color:${g.score/g.max_score>=.85?'var(--pr2)':g.score/g.max_score>=.7?'var(--bl)':g.score/g.max_score>=.5?'var(--wn)':'var(--dn)'}">${g.score}</span></td>
    <td class="text-sm" style="color:var(--tx2)">${g.weight}%</td>
    <td class="text-sm" style="color:var(--tx3)">${g.date}</td>
  </tr>`).join('')}
  </tbody></table></div>`;
}
function filterGrades(){
  const sid=document.getElementById('gradeStudent').value;
  const sub=document.getElementById('gradeSubject').value;
  document.querySelectorAll('#gradeBody tr').forEach(tr=>{
    const m=(!sid||tr.dataset.sid===sid)&&(!sub||tr.dataset.sub===sub);
    tr.style.display=m?'':'none';
  });
}
function showAddGrade(){
  if(!S.students.length)return;
  showModal(`
    <h3 class="font-bold text-lg mb-4">🏆 ثبت نمره جدید</h3>
    <div class="form-group"><label class="form-label">دانش‌آموز</label>
      <select class="input" id="gStudent">${S.students.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">درس</label><input class="input" id="gSubject" placeholder="مثلاً: ریاضی"></div>
    <div class="grid grid-2 gap-3">
      <div class="form-group"><label class="form-label">نوع</label>
        <select class="input" id="gType">
          <option value="quiz">کوییز (۱۰%)</option><option value="homework">تکلیف (۱۰%)</option>
          <option value="midterm">میان‌ترم (۲۵%)</option><option value="final">پایان‌ترم (۳۰%)</option>
          <option value="project">پروژه (۱۵%)</option><option value="practical">عملی (۱۰%)</option>
        </select></div>
      <div class="form-group"><label class="form-label">نمره (از ۲۰)</label>
        <input class="input" type="number" id="gScore" min="0" max="20" step="0.25"></div>
    </div>
    <div class="flex gap-3 mt-4">
      <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="saveGrade()">ثبت</button>
      <button class="btn btn-outline" style="flex:1;justify-content:center" onclick="closeModal()">انصراف</button>
    </div>`);
}
async function saveGrade(){
  const weights={quiz:10,homework:10,midterm:25,final:30,project:15,practical:10};
  const type=gType.value;
  const data={student_id:parseInt(gStudent.value),subject:gSubject.value,grade_type:type,
    score:parseFloat(gScore.value),max_score:20,weight:weights[type]};
  if(!data.subject||!data.score){toast('درس و نمره الزامی است','error');return;}
  const r=await api('/api/grades','POST',data);
  if(r?.ok){toast('نمره ثبت شد');closeModal();renderGrading();}else toast(r?.error||'خطا','error');
}

// ═══════════════════════════════════════════
// Reports
// ═══════════════════════════════════════════
async function renderReports(){
  const c=document.getElementById('pageContent');
  const d=await api('/api/reports');
  if(!d)return;
  c.innerHTML=`
  <div class="page-title">گزارش‌ها و آمار</div>
  <div class="page-desc">تحلیل جامع وضعیت انضباطی و آموزشی</div>
  <div class="grid grid-4 mb-4">
    ${[
      {l:'میانگین انضباط',v:d.avgDiscipline,i:'⚠️',c:'linear-gradient(135deg,#f59e0b,#f97316)'},
      {l:'میانگین نمرات',v:d.avgAcademic,i:'🏆',c:'linear-gradient(135deg,#10b981,#22c55e)'},
      {l:'نرخ حضور',v:d.avgAttendance+'%',i:'👥',c:'linear-gradient(135deg,#3b82f6,#06b6d4)'},
      {l:'کل دانش‌آموزان',v:d.total,i:'📊',c:'linear-gradient(135deg,#8b5cf6,#6366f1)'},
    ].map(s=>`<div class="card"><div class="stat-icon mb-3" style="background:${s.c}">${s.i}</div>
      <div class="stat-value">${s.v}</div><div class="stat-label">${s.l}</div></div>`).join('')}
  </div>
  <div class="grid grid-2 mb-4">
    <div class="card">
      <h3 class="font-bold mb-4">📊 توزیع انضباطی</h3>
      <div class="flex items-center gap-6">
        <div style="position:relative;width:8rem;height:8rem">
          <svg style="width:100%;height:100%;transform:rotate(-90deg)" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg3)" stroke-width="12"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--pr)" stroke-width="12"
              stroke-dasharray="${(d.posCount/(d.posCount+d.negCount))*251.2} 251.2" stroke-linecap="round"/>
          </svg>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
            <span class="text-lg font-bold">${Math.round(d.posCount/(d.posCount+d.negCount)*100)}%</span>
          </div>
        </div>
        <div><div class="flex items-center gap-2 mb-2"><div style="width:.75rem;height:.75rem;border-radius:50%;background:var(--pr)"></div><span class="text-sm">مثبت: ${d.posCount}</span></div>
        <div class="flex items-center gap-2"><div style="width:.75rem;height:.75rem;border-radius:50%;background:var(--dn)"></div><span class="text-sm">منفی: ${d.negCount}</span></div></div>
      </div>
    </div>
    <div class="card">
      <h3 class="font-bold mb-4">📉 تحلیل ریسک</h3>
      ${[
        {l:'پرخطر',c:d.riskHigh,color:'var(--dn)'},
        {l:'متوسط',c:d.riskMed,color:'var(--wn)'},
        {l:'کم‌خطر',c:d.riskLow,color:'var(--pr)'},
      ].map(r=>`<div class="mb-3">
        <div class="flex justify-between text-sm mb-1"><span style="color:var(--tx2)">${r.l}</span>
        <span class="font-medium">${r.c} نفر (${Math.round(r.c/d.total*100)}%)</span></div>
        ${progressBar((r.c/d.total)*100,r.color)}
      </div>`).join('')}
    </div>
  </div>
  <div class="card">
    <h3 class="font-bold mb-4">📊 مقایسه رشته‌ها</h3>
    <div class="grid grid-3 gap-4">
      ${d.fields.map(f=>`<div style="padding:1rem;background:var(--bg3);border-radius:.75rem">
        <div class="font-medium mb-3">${f.field}</div>
        <div class="flex justify-between text-sm mb-1"><span style="color:var(--tx2)">تعداد:</span><span class="font-medium">${f.count}</span></div>
        <div class="flex justify-between text-sm mb-1"><span style="color:var(--tx2)">انضباط:</span>
          <span class="font-medium ${scoreColor(f.avgDisc)}">${f.avgDisc}</span></div>
        <div class="flex justify-between text-sm"><span style="color:var(--tx2)">معدل:</span>
          <span class="font-medium ${gpaColor(f.avgGpa)}">${f.avgGpa}</span></div>
      </div>`).join('')}
    </div>
  </div>`;
}

// ═══════════════════════════════════════════
// Announcements
// ═══════════════════════════════════════════
async function renderAnnouncements(){
  const c=document.getElementById('pageContent');
  const data=await api('/api/announcements');
  S.announcements=data;
  c.innerHTML=`
  <div class="flex justify-between items-center mb-4" style="flex-wrap:wrap;gap:.5rem">
    <div><div class="page-title">اطلاعیه‌ها</div><div class="page-desc">اطلاع‌رسانی به کاربران</div></div>
    ${['admin','teacher'].includes(S.user.role)?`<button class="btn btn-primary" onclick="showAddAnn()">➕ اطلاعیه جدید</button>`:''}
  </div>
  ${data.sort((a,b)=>b.pinned-a.pinned).map(a=>{
    const colors={urgent:'border-right:4px solid var(--dn);background:var(--dn3)',
      warning:'border-right:4px solid var(--wn);background:var(--wn3)',
      success:'border-right:4px solid var(--pr);background:var(--pr4)',
      info:'border-right:4px solid var(--bl);background:var(--bl3)'};
    const icons={urgent:'🚨',warning:'⚠️',success:'✅',info:'ℹ️'};
    return `<div style="padding:1rem;border-radius:.75rem;margin-bottom:.75rem;${colors[a.type]||colors.info}">
      <div class="flex items-start gap-3">
        <span style="font-size:1.25rem">${icons[a.type]||'ℹ️'}</span>
        <div style="flex:1">
          <div class="flex items-center gap-2 mb-1">${a.pinned?'📌':''}<span class="font-bold text-sm">${a.title}</span></div>
          <p class="text-sm" style="color:var(--tx2)">${a.content}</p>
          <span class="text-xs" style="color:var(--tx3)">${a.date}</span>
        </div>
      </div>
    </div>`;
  }).join('')}`;
}
function showAddAnn(){
  showModal(`
    <h3 class="font-bold text-lg mb-4">📢 اطلاعیه جدید</h3>
    <div class="form-group"><label class="form-label">عنوان</label><input class="input" id="aTitle"></div>
    <div class="form-group"><label class="form-label">متن</label><textarea class="input" id="aContent"></textarea></div>
    <div class="grid grid-2 gap-3">
      <div class="form-group"><label class="form-label">نوع</label>
        <select class="input" id="aType"><option value="info">اطلاعات</option><option value="warning">هشدار</option>
        <option value="success">موفقیت</option><option value="urgent">فوری</option></select></div>
      <div class="form-group"><label class="form-label">&nbsp;</label>
        <label class="flex items-center gap-2 cursor-pointer" style="padding:.75rem;border:1px solid var(--bd);border-radius:.75rem">
          <input type="checkbox" id="aPinned"> <span class="text-sm">📌 سنجاق شود</span></label></div>
    </div>
    <div class="flex gap-3 mt-4">
      <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="saveAnn()">انتشار</button>
      <button class="btn btn-outline" style="flex:1;justify-content:center" onclick="closeModal()">انصراف</button>
    </div>`);
}
async function saveAnn(){
  const data={title:aTitle.value,content:aContent.value,type:aType.value,pinned:aPinned.checked?1:0};
  if(!data.title||!data.content){toast('عنوان و متن الزامی است','error');return;}
  const r=await api('/api/announcements','POST',data);
  if(r?.ok){toast('اطلاعیه منتشر شد');closeModal();renderAnnouncements();}else toast('خطا','error');
}

// ═══════════════════════════════════════════
// Documents
// ═══════════════════════════════════════════
async function renderDocuments(){
  const c=document.getElementById('pageContent');
  const students=await api('/api/students');
  const sid=S.user.role==='student'||S.user.role==='parent'?1:(students[0]?.id||1);
  const s=students.find(x=>x.id===sid)||students[0];
  const grades=await api(`/api/grades?student_id=${sid}`);
  const disc=await api(`/api/discipline?student_id=${sid}`);
  const gpa=grades.length?grades.reduce((a,g)=>a+(g.score/g.max_score)*20*(g.weight/100),0)/grades.reduce((a,g)=>a+g.weight/100,0):0;
  c.innerHTML=`
  <div class="page-title">اسناد و کارنامه</div>
  <div class="page-desc">صدور و چاپ اسناد آموزشی</div>
  <div class="flex gap-2 mb-4" style="flex-wrap:wrap">
    ${['admin','teacher'].includes(S.user.role)?`<select class="input" style="width:auto;margin:0" id="docStudent" onchange="renderDocuments()">
      ${students.map(st=>`<option value="${st.id}" ${st.id===sid?'selected':''}>${st.name}</option>`).join('')}
    </select>`:''}
  </div>
  <div class="card" style="overflow:hidden;padding:0">
    <div style="background:linear-gradient(135deg,#059669,#10b981);padding:1.5rem;color:#fff">
      <div class="flex justify-between items-center">
        <div><div class="text-lg font-bold">کارنامه تحصیلی و انضباطی</div><div style="opacity:.8">هنرستان فنی و حرفه‌ای</div></div>
        <div class="text-sm">📅 ۱۴۰۴/۰۳/۱۶</div>
      </div>
    </div>
    <div style="padding:1.5rem">
      <div class="flex items-center gap-4 mb-4" style="padding-bottom:1rem;border-bottom:1px solid var(--bd)">
        <div class="avatar avatar-lg">${s.name.charAt(0)}</div>
        <div><div class="text-lg font-bold">${s.name}</div>
        <div class="text-sm" style="color:var(--tx2)">${s.field} - ${s.grade} - ${s.class_name}</div>
        <div class="text-xs" style="color:var(--tx3)" dir="ltr">کد ملی: ${s.national_id}</div></div>
      </div>
      <div class="text-center mb-4" style="padding:1.5rem;background:var(--pr4);border-radius:1rem">
        <div class="text-sm" style="color:var(--tx2)">معدل وزنی</div>
        <div class="text-3xl font-bold text-green">${gpa.toFixed(2)}</div>
        <div class="text-xs" style="color:var(--tx3)">از ۲۰</div>
      </div>
      <h4 class="font-bold mb-3">نمرات</h4>
      <div class="tbl-wrap mb-4"><table><thead><tr><th>درس</th><th>نوع</th><th>نمره</th><th>وزن</th></tr></thead>
      <tbody>${grades.map(g=>`<tr><td>${g.subject}</td><td>${g.grade_type}</td>
        <td class="font-bold">${g.score} از ${g.max_score}</td><td>${g.weight}%</td></tr>`).join('')}
      </tbody></table></div>
      <h4 class="font-bold mb-3">سوابق انضباطی</h4>
      ${disc.length?disc.map(r=>`<div style="padding:.75rem;border-radius:.75rem;margin-bottom:.5rem;
        background:${r.type==='positive'?'var(--pr4)':'var(--dn3)'}">
        <div class="flex justify-between items-center">
          <div><span class="text-sm font-medium">${r.category}</span>
          <p class="text-xs" style="color:var(--tx2)">${r.description}</p></div>
          <span class="font-bold ${r.points>0?'text-green':'text-red'}">${r.points>0?'+':''}${r.points}</span>
        </div></div>`).join(''):'<div class="empty-state text-sm">سابقه‌ای ثبت نشده</div>'}
      <div class="grid grid-3 gap-3 mt-4">
        <div class="text-center" style="padding:.75rem;background:var(--bg3);border-radius:.75rem">
          <div class="text-xl font-bold text-green">${s.discipline_score}</div><div class="text-xs" style="color:var(--tx3)">امتیاز انضباطی</div></div>
        <div class="text-center" style="padding:.75rem;background:var(--bg3);border-radius:.75rem">
          <div class="text-xl font-bold text-blue">${s.attendance_rate}%</div><div class="text-xs" style="color:var(--tx3)">نرخ حضور</div></div>
        <div class="text-center" style="padding:.75rem;background:var(--bg3);border-radius:.75rem">
          <div class="text-xl font-bold" style="color:var(--pp)">${grades.length}</div><div class="text-xs" style="color:var(--tx3)">تعداد ارزیابی</div></div>
      </div>
    </div>
    <div style="padding:1rem;border-top:1px solid var(--bd);display:flex;gap:.75rem;justify-content:flex-end">
      <button class="btn btn-outline btn-sm" onclick="window.print()">🖨️ چاپ</button>
      <button class="btn btn-primary btn-sm" onclick="toast('دانلود PDF (نسخه نمایشی)')">📥 دانلود PDF</button>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════
// Settings
// ═══════════════════════════════════════════
function renderSettings(){
  const c=document.getElementById('pageContent');
  c.innerHTML=`
  <div class="page-title">تنظیمات سامانه</div>
  <div class="page-desc">مدیریت و پیکربندی</div>
  <div class="card">
    <h3 class="font-bold mb-4">🏫 اطلاعات هنرستان</h3>
    <div class="grid grid-2 gap-4">
      <div class="form-group"><label class="form-label">نام هنرستان</label>
        <input class="input" value="هنرستان فنی شهید رجایی"></div>
      <div class="form-group"><label class="form-label">کد مدرسه</label>
        <input class="input" value="۴۴۷۱"></div>
      <div class="form-group"><label class="form-label">آدرس</label>
        <input class="input" value="تهران، خیابان آزادی، پلاک ۱۲۳"></div>
      <div class="form-group"><label class="form-label">تلفن</label>
        <input class="input" value="۰۲۱-۶۶۱۲۳۴۵۶" dir="ltr"></div>
      <div class="form-group"><label class="form-label">سال تحصیلی</label>
        <select class="input"><option>۱۴۰۴-۱۴۰۳</option><option>۱۴۰۳-۱۴۰۲</option></select></div>
      <div class="form-group"><label class="form-label">مدیر</label>
        <input class="input" value="آقای رحیمی"></div>
    </div>
    <h3 class="font-bold mb-4 mt-4">⚠️ تنظیمات انضباطی</h3>
    <div style="padding:1rem;background:var(--bg3);border-radius:.75rem;margin-bottom:.75rem">
      <label class="form-label">حداقل امتیاز انضباطی قابل قبول</label>
      <input class="input" type="number" value="50" style="width:8rem">
      <p class="text-xs mt-2" style="color:var(--tx3)">دانش‌آموزان با امتیاز کمتر در لیست پرخطر قرار می‌گیرند</p>
    </div>
    <div style="padding:1rem;background:var(--bg3);border-radius:.75rem;margin-bottom:.75rem">
      <label class="form-label">حداکثر غیبت مجاز (روز)</label>
      <input class="input" type="number" value="6" style="width:8rem">
    </div>
    <div style="padding:1rem;background:var(--bg3);border-radius:.75rem;margin-bottom:.75rem">
      <label class="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked> <div><span class="text-sm font-medium">ارسال خودکار پیامک به ولی</span>
        <p class="text-xs" style="color:var(--tx3)">در صورت غیبت، پیامک به ولی ارسال شود</p></div></label>
    </div>
    <div style="padding:1rem;background:var(--bg3);border-radius:.75rem;margin-bottom:.75rem">
      <label class="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked> <div><span class="text-sm font-medium">هشدار دانش‌آموزان در معرض خطر</span>
        <p class="text-xs" style="color:var(--tx3)">نمایش هشدار در داشبورد</p></div></label>
    </div>
    <h3 class="font-bold mb-4 mt-4">💾 پشتیبان‌گیری</h3>
    <div style="padding:1rem;background:var(--pr4);border-radius:.75rem;border:1px solid rgba(16,185,129,.2);margin-bottom:.75rem">
      <div class="flex justify-between items-center">
        <div><span class="font-medium text-green">آخرین پشتیبان</span><br>
        <span class="text-sm" style="color:var(--tx2)">۱۴۰۴/۰۳/۱۵ - ساعت ۲۳:۰۰</span></div>
        <button class="btn btn-outline btn-sm">بازیابی</button>
      </div>
    </div>
    <div class="flex gap-3">
      <button class="btn btn-outline" style="flex:1;justify-content:center" onclick="toast('پشتیبان ایجاد شد')">📦 ایجاد پشتیبان</button>
      <button class="btn btn-outline" style="flex:1;justify-content:center" onclick="toast('بازیابی از فایل (نمایشی)')">📥 بازیابی از فایل</button>
    </div>
    <div class="flex gap-3 mt-4" style="justify-content:flex-end">
      <button class="btn btn-primary" onclick="toast('تنظیمات ذخیره شد')">💾 ذخیره تنظیمات</button>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════
// Init
// ═══════════════════════════════════════════
if(S.dark){document.documentElement.classList.add('dark');document.getElementById('darkBtn')&&(document.getElementById('darkBtn').textContent='☀️');}
</script>
</body>
</html>"""

# ═══════════════════════════════════════════
# Routes
# ═══════════════════════════════════════════
@app.route('/')
def index():
    user = None
    if 'uid' in session:
        db = get_db()
        user = db.execute("SELECT * FROM users WHERE id=?", (session['uid'],)).fetchone()
        if user:
            user = dict(user)
    return render_template_string(TPL, user=user)

# ─── Auth API ───
@app.route('/api/login', methods=['POST'])
def api_login():
    d = request.json
    db = get_db()
    nid = d.get('national_id', '')
    pw = d.get('password', '')
    role = d.get('role', 'admin')
    
    # Try exact match first
    pw_hash = hashlib.sha256(pw.encode()).hexdigest()
    user = db.execute("SELECT * FROM users WHERE national_id=? AND password=?", (nid, pw_hash)).fetchone()
    
    # Demo mode: allow any login with valid role
    if not user:
        user = db.execute("SELECT * FROM users WHERE role=? LIMIT 1", (role,)).fetchone()
    
    if not user:
        user = db.execute("SELECT * FROM users LIMIT 1").fetchone()
    
    if user:
        user = dict(user)
        session['uid'] = user['id']
        session['role'] = user['role']
        session['name'] = user['name']
        return jsonify(ok=True, user={'id': user['id'], 'name': user['name'], 'role': user['role']})
    return jsonify(error='کاربر یافت نشد'), 401

@app.route('/api/logout')
def api_logout():
    session.clear()
    return jsonify(ok=True)

@app.route('/api/me')
@login_required
def api_me():
    db = get_db()
    u = db.execute("SELECT * FROM users WHERE id=?", (session['uid'],)).fetchone()
    return jsonify(dict(u)) if u else jsonify(error='not found'), 404

# ─── Dashboard API ───
@app.route('/api/dashboard')
@login_required
def api_dashboard():
    db = get_db()
    students = db.execute("SELECT * FROM students").fetchall()
    total = len(students)
    avg_disc = round(sum(s['discipline_score'] for s in students) / total) if total else 0
    avg_att = round(sum(s['attendance_rate'] for s in students) / total) if total else 0
    
    # Calculate GPAs
    for s in students:
        grades = db.execute("SELECT * FROM grades WHERE student_id=?", (s['id'],)).fetchall()
        if grades:
            tw = sum(g['weight'] for g in grades)
            if tw > 0:
                gpa = sum((g['score']/g['max_score'])*20*(g['weight']/100) for g in grades) / (tw/100)
                s = dict(s); s['gpa'] = round(gpa, 1)
    
    disc = db.execute("SELECT * FROM discipline").fetchall()
    pos = len([d for d in disc if d['type'] == 'positive'])
    neg = len([d for d in disc if d['type'] == 'negative'])
    
    # Average academic from grades
    all_grades = db.execute("SELECT * FROM grades").fetchall()
    avg_acad = 0
    if all_grades:
        avg_acad = round(sum(g['score'] for g in all_grades) / len(all_grades), 1)
    
    # Top students
    top = sorted([dict(s) for s in students], key=lambda x: x['discipline_score'], reverse=True)[:5]
    
    # At risk
    at_risk = [dict(s) for s in students if s['discipline_score'] < 70 or s['attendance_rate'] < 80]
    
    anns = [dict(a) for a in db.execute("SELECT * FROM announcements ORDER BY pinned DESC, date DESC LIMIT 4").fetchall()]
    
    return jsonify(
        totalStudents=total, avgDiscipline=avg_disc, avgAcademic=avg_acad,
        avgAttendance=avg_att, positiveCount=pos, negativeCount=neg,
        topStudents=[{'name': s['name'], 'field': s['field'], 'score': s['discipline_score']} for s in top],
        atRisk=[{'name': s['name'], 'discipline_score': s['discipline_score'], 
                 'attendance_rate': s['attendance_rate'], 'gpa': s.get('gpa', '-')} for s in at_risk],
        announcements=anns
    )

# ─── Students API ───
@app.route('/api/students')
@login_required
def api_students():
    db = get_db()
    students = [dict(s) for s in db.execute("SELECT * FROM students ORDER BY name").fetchall()]
    for s in students:
        grades = db.execute("SELECT * FROM grades WHERE student_id=?", (s['id'],)).fetchall()
        if grades:
            tw = sum(g['weight'] for g in grades)
            s['gpa'] = round(sum((g['score']/g['max_score'])*20*(g['weight']/100) for g in grades) / (tw/100), 1) if tw > 0 else 0
        else:
            s['gpa'] = None
    return jsonify(students)

@app.route('/api/students/<int:id>')
@login_required
def api_student_detail(id):
    db = get_db()
    s = db.execute("SELECT * FROM students WHERE id=?", (id,)).fetchone()
    return jsonify(dict(s)) if s else jsonify(error='not found'), 404

@app.route('/api/students', methods=['POST'])
@login_required
def api_add_student():
    d = request.json
    db = get_db()
    try:
        db.execute("INSERT INTO students(name,national_id,field,grade,class_name,phone,parent_phone) VALUES(?,?,?,?,?,?,?)",
            (d['name'], d['national_id'], d.get('field',''), d.get('grade',''), d.get('class_name',''),
             d.get('phone',''), d.get('parent_phone','')))
        db.commit()
        return jsonify(ok=True)
    except Exception as e:
        return jsonify(error=str(e)), 400

# ─── Attendance API ───
@app.route('/api/attendance', methods=['POST'])
@login_required
def api_save_attendance():
    d = request.json
    db = get_db()
    date = d.get('date', '1404/03/16')
    for sid, status in d.get('records', {}).items():
        db.execute("INSERT INTO attendance(student_id,date,status) VALUES(?,?,?)", (int(sid), date, status))
    db.commit()
    return jsonify(ok=True)

# ─── Discipline API ───
@app.route('/api/discipline')
@login_required
def api_discipline():
    db = get_db()
    sid = request.args.get('student_id')
    if sid:
        rows = db.execute("SELECT d.*, s.name as student_name FROM discipline d JOIN students s ON d.student_id=s.id WHERE d.student_id=? ORDER BY d.date DESC", (sid,)).fetchall()
    else:
        rows = db.execute("SELECT d.*, s.name as student_name FROM discipline d JOIN students s ON d.student_id=s.id ORDER BY d.date DESC").fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/discipline', methods=['POST'])
@login_required
def api_add_discipline():
    d = request.json
    db = get_db()
    db.execute("INSERT INTO discipline(student_id,type,category,description,points,date,recorded_by) VALUES(?,?,?,?,?,?,?)",
        (d['student_id'], d['type'], d['category'], d['description'], d['points'], '1404/03/16', session.get('name','')))
    # Update student discipline score
    student = db.execute("SELECT * FROM students WHERE id=?", (d['student_id'],)).fetchone()
    if student:
        new_score = max(0, min(100, student['discipline_score'] + d['points']))
        db.execute("UPDATE students SET discipline_score=? WHERE id=?", (new_score, d['student_id']))
    db.commit()
    return jsonify(ok=True)

# ─── Grades API ───
@app.route('/api/grades')
@login_required
def api_grades():
    db = get_db()
    sid = request.args.get('student_id')
    if sid:
        rows = db.execute("SELECT g.*, s.name as student_name FROM grades g JOIN students s ON g.student_id=s.id WHERE g.student_id=? ORDER BY g.date DESC", (sid,)).fetchall()
    else:
        rows = db.execute("SELECT g.*, s.name as student_name FROM grades g JOIN students s ON g.student_id=s.id ORDER BY g.date DESC").fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/grades', methods=['POST'])
@login_required
def api_add_grade():
    d = request.json
    db = get_db()
    db.execute("INSERT INTO grades(student_id,subject,grade_type,score,max_score,weight,date,semester) VALUES(?,?,?,?,?,?,?,?)",
        (d['student_id'], d['subject'], d['grade_type'], d['score'], d.get('max_score',20),
         d.get('weight',10), '1404/03/16', d.get('semester',1)))
    db.commit()
    return jsonify(ok=True)

# ─── Announcements API ───
@app.route('/api/announcements')
@login_required
def api_announcements():
    db = get_db()
    rows = db.execute("SELECT * FROM announcements ORDER BY pinned DESC, date DESC").fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/announcements', methods=['POST'])
@login_required
def api_add_announcement():
    d = request.json
    db = get_db()
    db.execute("INSERT INTO announcements(title,content,type,date,pinned,target_roles) VALUES(?,?,?,?,?,?)",
        (d['title'], d['content'], d['type'], '1404/03/16', d.get('pinned',0), 'all'))
    db.commit()
    return jsonify(ok=True)

# ─── Reports API ───
@app.route('/api/reports')
@login_required
def api_reports():
    db = get_db()
    students = db.execute("SELECT * FROM students").fetchall()
    total = len(students)
    avg_disc = round(sum(s['discipline_score'] for s in students) / total) if total else 0
    avg_att = round(sum(s['attendance_rate'] for s in students) / total) if total else 0
    
    all_grades = db.execute("SELECT * FROM grades").fetchall()
    avg_acad = round(sum(g['score'] for g in all_grades) / len(all_grades), 1) if all_grades else 0
    
    disc = db.execute("SELECT * FROM discipline").fetchall()
    pos_count = len([d for d in disc if d['type'] == 'positive'])
    neg_count = len([d for d in disc if d['type'] == 'negative'])
    
    risk_high = len([s for s in students if s['discipline_score'] < 65 or s['attendance_rate'] < 80])
    risk_low = len([s for s in students if s['discipline_score'] >= 80 and s['attendance_rate'] >= 90])
    risk_med = total - risk_high - risk_low
    
    # Field stats
    fields = {}
    for s in students:
        f = s['field']
        if f not in fields:
            fields[f] = {'field': f, 'count': 0, 'disc_sum': 0, 'students': []}
        fields[f]['count'] += 1
        fields[f]['disc_sum'] += s['discipline_score']
        fields[f]['students'].append(s['id'])
    
    field_stats = []
    for f, data in fields.items():
        grades = db.execute("SELECT * FROM grades WHERE student_id IN ({})".format(
            ','.join(str(x) for x in data['students']))).fetchall()
        avg_gpa = round(sum(g['score'] for g in grades) / len(grades), 1) if grades else 0
        field_stats.append({
            'field': f, 'count': data['count'],
            'avgDisc': round(data['disc_sum'] / data['count']),
            'avgGpa': avg_gpa
        })
    
    return jsonify(
        total=total, avgDiscipline=avg_disc, avgAcademic=avg_acad, avgAttendance=avg_att,
        posCount=pos_count, negCount=neg_count,
        riskHigh=risk_high, riskMed=risk_med, riskLow=risk_low,
        fields=field_stats
    )

# ═══════════════════════════════════════════
# اجرای برنامه
# ═══════════════════════════════════════════
if __name__ == '__main__':
    init_db()
    seed_data()
    print("""
╔══════════════════════════════════════════════════════════╗
║   سامانه جامع انضباطی و ارزشیابی هنرستان               ║
║   ✅ سرور آماده است                                      ║
║   🌐 آدرس: http://localhost:{port:<5}                      ║
║                                                          ║
║   🔑 ورود سریع:                                          ║
║   مدیر: کد ملی 0000000001 / رمز admin                    ║
║   یا از دکمه‌های ورود سریع استفاده کنید                  ║
╚══════════════════════════════════════════════════════════╝
    """.format(port=PORT))
    app.run(host='0.0.0.0', port=PORT, debug=os.environ.get('DEBUG', 'true').lower() == 'true')
