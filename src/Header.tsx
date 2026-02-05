import Moon from './assets/Moon.svg';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Header(){
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';

    return(
        <header className="pageHeaderCentered">
            {isHome ? (
              // 홈에서도 가운데 정렬이 유지되게 “자리만” 차지
              <span aria-hidden="true" style={{ width: 44, height: 44 }} />
            ) : (
              <button
                type="button"
                className="iconButton"
                onClick={() => navigate(-1)}
                aria-label="back"
              >
                ←
              </button>
            )}

            <h1 className="pageTitleCentered">Make my day!</h1>

            <button type="button" className="iconButton" aria-label="theme toggle (todo)">
              <img src={Moon} alt="" />
            </button>
        </header>
    )
}