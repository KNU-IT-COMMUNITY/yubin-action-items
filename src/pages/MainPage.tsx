import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckCircle from '../assets/Check circle.svg';
import CalendarCard from '../components/Calendar';
import { loadDayTodos } from '../lib/todoStorage';
import { css } from '@emotion/react';

const grid2Css = css`
  margin-top: 28px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 28px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const panelCss = css`
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.75);
  padding: 28px;
  min-height: 520px;

  @media (max-width: 900px) {
    min-height: 420px;
  }
`;

const emptyStateCss = css`
  height: calc(100% - 80px);
  display: grid;
  place-items: center;
  gap: 14px;
  text-align: center;
`;

const emptyStateTitleCss = css`
  margin: 0;
  font-size: 30px;
  font-weight: 800;
`;

const primaryButtonCss = css`
  margin-top: 18px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: #111;
  color: #fff;
  padding: 12px 16px;
  font-weight: 700;
`;

const panelFooterHintCss = css`
  margin-top: 18px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
`;

export default function MainPage() {
  const navigate = useNavigate();
  const today = dayjs();
  const todayKey = today.format('YYYY-MM-DD');

  const todayTodos = useMemo(() => loadDayTodos(todayKey), [todayKey]);

  return (
    <main>

      <div css={grid2Css}>
        {/* Left: Today's List */}
        <section css={panelCss} aria-label="Today's List panel">
          <h2 className="panelTitle">Today’s List</h2>
          <div className="panelMeta">{today.format('YYYY.MM.DD')}</div>

          {todayTodos.length === 0 ? (
            <div css={emptyStateCss}>
              <img src={CheckCircle} alt="" width={56} height={56} />
              <p css={emptyStateTitleCss}>No Schedule</p>

              {/* “메인 → 투두리스트 페이지 이동” */}
              <button type="button" css={primaryButtonCss} onClick={() => navigate(`/todos/${todayKey}`)}>
                Todo 만들기
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
                {todayTodos.slice(0, 6).map((t) => (
                  <li key={t.id} style={{ color: 'rgba(0,0,0,0.8)', fontWeight: 650 }}>
                    {t.title}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                css={primaryButtonCss}
                style={{ marginTop: 18 }}
                onClick={() => navigate(`/todos/${todayKey}`)}
              >
                오늘 투두리스트 보기
              </button>
            </div>
          )}
        </section>

        <section css={panelCss} aria-label="Calendar panel">
          <h2 className="panelTitle">Calender</h2>

          <CalendarCard
            initialDate={today.toDate()}
            onSelectDate={(date) => {
              const key = dayjs(date).format('YYYY-MM-DD');
              navigate(`/todos/${key}`);
            }}
          />

          <div css={panelFooterHintCss}>clicking on the date</div>
        </section>
      </div>
    </main>
  );
}

