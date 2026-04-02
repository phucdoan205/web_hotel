import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="home">
      <div className="homeCard">
        <div className="homeTitle">WEB HOTEL</div>
        <div className="homeSub">Chọn vai trò để vào hệ thống</div>
        <div className="homeActions">
          <Link className="btn btnPrimary" to="/housekeeping">
            Housekeeping
          </Link>
          <Link className="btn btnGhost" to="/receptionist">
            Receptionist
          </Link>
        </div>
      </div>
    </div>
  );
}

