import React, { useState, useEffect } from 'react';
import './App.css';
import { THAILAND_LOCATIONS } from './data/thailand-data';

const API_URL = "https://script.google.com/macros/s/AKfycbweTpu_NULvdV3aK8ZeKc9cLOkKD_1HpfObH6ki9w7k4vfwVH4phghlaOizZnNa-301Qw/exec";

function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard', 'register', 'signup'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    major: '',
    currentProvince: '',
    currentDistrict: '',
    targetProvince: '',
    targetDistrict: '',
    contact: ''
  });

  const provinces = Object.keys(THAILAND_LOCATIONS).sort();

  useEffect(() => {
    fetchData();
    const savedUser = localStorage.getItem('teach_swap_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = { name: formData.name, major: formData.major, contact: formData.contact };
    localStorage.setItem('teach_swap_user', JSON.stringify(newUser));
    setUser(newUser);
    setIsLoggedIn(true);
    setView('register');
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        name: user?.name || formData.name,
        major: user?.major || formData.major,
        contact: user?.contact || formData.contact
      };
      
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      alert("บันทึกความประสงค์การย้ายสำเร็จ!");
      setView('dashboard');
      fetchData();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <header>
        <h1>ครูแลกเปลี่ยน (Teach Swap)</h1>
        <p>ระบบจับคู่ย้ายตำแหน่งข้าราชการครูออนไลน์</p>
        <nav>
          <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>ค้นหาการย้าย</button>
          {!isLoggedIn ? (
            <button className={view === 'signup' ? 'active' : ''} onClick={() => setView('signup')}>สมัครสมาชิก</button>
          ) : (
            <button className={view === 'register' ? 'active' : ''} onClick={() => setView('register')}>แจ้งความประสงค์ย้าย</button>
          )}
        </nav>
      </header>

      <main>
        {view === 'dashboard' && (
          <div className="card">
            <h2>🔎 รายการแจ้งความประสงค์</h2>
            {loading ? <p>กำลังโหลดข้อมูล...</p> : (
              <div style={{overflowX: 'auto'}}>
                <table>
                  <thead>
                    <tr>
                      <th>วิชาเอก</th>
                      <th>ต้นสังกัดปัจจุบัน</th>
                      <th>ต้องการย้ายไป</th>
                      <th>ผู้แจ้ง / ติดต่อ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={index}>
                        <td><span className="badge">{item.Major}</span></td>
                        <td>{item.CurrentDistrict}, {item.CurrentProvince}</td>
                        <td><span className="target-text">→ {item.TargetDistrict}, {item.TargetProvince}</span></td>
                        <td>{item.Name} <br/><small>{item.Contact}</small></td>
                      </tr>
                    ))}
                    {data.length === 0 && !loading && <tr><td colSpan={4} style={{textAlign:'center'}}>ยังไม่มีข้อมูลในระบบ</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {view === 'signup' && (
          <div className="card">
            <h2>📝 สมัครสมาชิกใหม่</h2>
            <form onSubmit={handleSignUp}>
              <div className="form-group">
                <label>ชื่อ-นามสกุล</label>
                <input type="text" required placeholder="ระบุชื่อจริง-นามสกุล" onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>วิชาเอก</label>
                <input type="text" required placeholder="เช่น คอมพิวเตอร์, ประถมศึกษา" onChange={(e) => setFormData({...formData, major: e.target.value})} />
              </div>
              <div className="form-group">
                <label>เบอร์โทรศัพท์ / LINE ID</label>
                <input type="text" required placeholder="สำหรับให้คู่สลับติดต่อกลับ" onChange={(e) => setFormData({...formData, contact: e.target.value})} />
              </div>
              <button type="submit" className="btn-submit">ยืนยันการสมัครสมาชิก</button>
            </form>
          </div>
        )}

        {view === 'register' && isLoggedIn && (
          <div className="card">
            <h2>📍 ระบุพื้นที่ที่ต้องการย้าย</h2>
            <p>สวัสดีคุณครู <strong>{user?.name}</strong> ยินดีต้อนรับสู่ระบบครับ</p>
            <form onSubmit={handleSubmitRequest}>
              <h3>สังกัดปัจจุบัน</h3>
              <div className="row">
                <div className="form-group">
                  <label>จังหวัดปัจจุบัน</label>
                  <select required value={formData.currentProvince} onChange={(e) => setFormData({...formData, currentProvince: e.target.value, currentDistrict: ''})}>
                    <option value="">-- เลือกจังหวัด --</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>อำเภอปัจจุบัน</label>
                  <select required value={formData.currentDistrict} onChange={(e) => setFormData({...formData, currentDistrict: e.target.value})} disabled={!formData.currentProvince}>
                    <option value="">-- เลือกอำเภอ --</option>
                    {formData.currentProvince && (THAILAND_LOCATIONS as any)[formData.currentProvince].map((d: string) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <h3>เป้าหมายที่ต้องการย้ายไป</h3>
              <div className="row">
                <div className="form-group">
                  <label>จังหวัดเป้าหมาย</label>
                  <select required value={formData.targetProvince} onChange={(e) => setFormData({...formData, targetProvince: e.target.value, targetDistrict: ''})}>
                    <option value="">-- เลือกจังหวัด --</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>อำเภอเป้าหมาย</label>
                  <select required value={formData.targetDistrict} onChange={(e) => setFormData({...formData, targetDistrict: e.target.value})} disabled={!formData.targetProvince}>
                    <option value="">-- เลือกอำเภอ --</option>
                    {formData.targetProvince && (THAILAND_LOCATIONS as any)[formData.targetProvince].map((d: string) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-submit" style={{marginTop: '20px'}}>
                {loading ? 'กำลังบันทึก...' : 'ส่งข้อมูลความประสงค์ย้าย'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
