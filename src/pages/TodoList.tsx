import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadDayTodos, saveDayTodos } from '../lib/todoStorage';
import type { TodoItem } from '../types/todo';
import { css } from '@emotion/react';
import Edit from '../assets/Edit.svg' 
import Trash from '../assets/Trash.svg'

const START_HOUR = 6;
const END_HOUR = 25; // 24는 표시용 끝(23시까지 슬롯)
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

const todoFrameCss = css`
  margin: 28px auto 0;
  width: min(980px, 100%);
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.75);
  padding: 28px;
`;

const todoGridCss = css`
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 28px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const todoLeftCss = css`
  min-height: 420px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const floatingAreaCss = css`
  flex: 1;
  position: relative;
  border-radius: 14px;
`;

const floatingHintCss = css`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: rgba(0, 0, 0, 0.4);
  font-weight: 700;
`;

const floatingListCss = css`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-content: flex-start;
`;

const todoChipBaseCss = css`
  user-select: none;
  cursor: grab;
  border: 0;
  background: rgba(0, 0, 0, 0.12);
  color: rgba(0, 0, 0, 0.85);
  padding: 10px 18px;
  border-radius: 999px;
  font-weight: 700;

  &:active {
    cursor: grabbing;
  }
`;

const todoChipEditableCss = css`
  position: relative;
  padding-right: 92px; /* 우측 액션 버튼 공간 */
  display: inline-flex;
  align-items: center;
  gap: 10px;

  &:hover [data-actions='true'] {
    opacity: 1;
    pointer-events: auto;
  }
`;

const todoChipTitleCss = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
`;

const todoChipActionsCss = css`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  gap: 6px;
  opacity: 0;
  pointer-events: none;
`;

const todoChipActionBtnCss = css`
  height: 26px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  background: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
`;

const todoChipActionBtnDangerCss = css`
  
  color: rgba(190, 0, 0, 0.9);
`;

const todoChipInputCss = css`
  height: 28px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  padding: 0 10px;
  outline: none;
  background: rgba(255, 255, 255, 0.92);
  font-weight: 750;
  width: 220px;
`;

const todoFormCss = css`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
`;

const todoInputCss = css`
  height: 44px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  padding: 0 12px;
  outline: none;
  background: rgba(255, 255, 255, 0.9);
`;

const todoAddBtnCss = css`
  height: 44px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 0 14px;
  font-weight: 800;
`;

const timelineCss = css`
  border-radius: 14px;
  padding: 10px 10px 10px 18px;
`;

const timelineTitleCss = css`
  margin: 0;
  text-align: center;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.55);
`;

const timelineSlotCss = css`
  height: 24px;
  display: grid;
  grid-template-columns: 26px 1fr;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
`;

const timelineHourCss = css`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
  text-align: right;
`;

const timelineDropZoneCss = css`
  height: 24px;
  border-radius: 8px;
  border: 1px dashed rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  padding: 0 8px;

  &[data-can-drop='true'] {
    border-color: rgba(0, 0, 0, 0.3);
    background: rgba(0, 0, 0, 0.04);
  }
`;

function createId() {
  // 학습용: 간단한 id 생성(충돌 확률 낮음)
  return `t_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function TodoList() {
  const params = useParams();
  const today = dayjs();
  const todayKey = today.format('YYYY-MM-DD');

  // URL이 /todos/2026-02-05 형태면 그 값을 쓰고, 아니면 오늘로 fallback
  const dateKey = useMemo(() => {
    const raw = params.dateKey;
    if (!raw) return todayKey;
    if (!DATE_KEY_RE.test(raw)) return todayKey;
    return dayjs(raw).isValid() ? raw : todayKey;
  }, [params.dateKey, todayKey]);

  const pageDate = useMemo(() => dayjs(dateKey), [dateKey]);

  // 핵심 개념: "UI는 state의 결과물"이라서, 투두는 배열 state로 관리
  const [todos, setTodos] = useState<TodoItem[]>(() => loadDayTodos(dateKey));
  const [input, setInput] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverSlotIndex, setHoverSlotIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // dateKey가 바뀌면 해당 날짜의 투두를 로드
  useEffect(() => {
    setTodos(loadDayTodos(dateKey));
    setInput('');
    setDraggingId(null);
    setHoverSlotIndex(null);
    setEditingId(null);
    setEditingValue('');
  }, [dateKey]);

  // todos가 바뀌면 현재 dateKey에 저장(새로고침/메인페이지 표시용)
  useEffect(() => {
    saveDayTodos(dateKey, todos);
  }, [dateKey, todos]);

  // todos에서 필요할 때만 계산해서 쓰기
  const floatingTodos = useMemo(() => todos.filter((t) => t.slotIndex === null), [todos]);
  const scheduledBySlot = useMemo(() => {
    const map = new Map<number, TodoItem>();
    for (const t of todos) {
      if (t.slotIndex !== null) map.set(t.slotIndex, t);
    }
    return map;
  }, [todos]);

  const hours = useMemo(() => {
    const list: number[] = [];
    for (let h = START_HOUR; h < END_HOUR; h += 1) list.push(h);
    return list;
  }, []);

  function addTodo() {
    const title = input.trim();
    if (!title) return;
    setTodos((prev) => [...prev, { id: createId(), title, slotIndex: null }]);
    setInput('');
  }

  function onDragStartTodo(id: string) {
    setDraggingId(id);
  }

  function onDragEndTodo() {
    setDraggingId(null);
    setHoverSlotIndex(null);
  }

  // - 겹침 불가: 슬롯에 이미 todo가 있으면 배치하지 않음
  function scheduleToSlot(todoId: string, slotIndex: number) {
    setTodos((prev) => {
      const occupied = prev.some((t) => t.slotIndex === slotIndex && t.id !== todoId);
      if (occupied) return prev; // 겹침 불가 → 상태 변경 없음(=드롭 실패)

      return prev.map((t) => (t.id === todoId ? { ...t, slotIndex } : t));
    });
  }

  // floating 영역에 drop하면 "배치 해제"
  function unschedule(todoId: string) {
    setTodos((prev) => prev.map((t) => (t.id === todoId ? { ...t, slotIndex: null } : t)));
  }

  function deleteTodo(todoId: string) {
    setTodos((prev) => prev.filter((t) => t.id !== todoId));
    if (editingId === todoId) {
      setEditingId(null);
      setEditingValue('');
    }
  }

  function startEdit(todo: TodoItem) {
    setEditingId(todo.id);
    setEditingValue(todo.title);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingValue('');
  }

  function commitEdit(todoId: string) {
    const nextTitle = editingValue.trim();
    if (!nextTitle) return; // 빈 값 저장은 막기
    setTodos((prev) => prev.map((t) => (t.id === todoId ? { ...t, title: nextTitle } : t)));
    cancelEdit();
  }

  return (
    <main>
      <section css={todoFrameCss} aria-label="Todo List frame">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <h2 className="panelTitle">Todo List</h2>
            <div className="panelMeta">{pageDate.format('YYYY.MM.DD')}</div>
          </div>
        </div>

        <div css={todoGridCss}>
          <div css={todoLeftCss}>
            <div
              css={floatingAreaCss}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={() => {
                if (!draggingId) return;
                unschedule(draggingId);
                onDragEndTodo();
              }}
              aria-label="floating todo area"
            >
              {floatingTodos.length === 0 ? (
                <div css={floatingHintCss}>할 일이 없습니다!</div>
              ) : (
                <div css={floatingListCss}>
                  {floatingTodos.map((t) => (
                    <div
                      key={t.id}
                      css={[todoChipBaseCss, todoChipEditableCss]}
                      draggable={editingId !== t.id}
                      onDragStart={() => {
                        if (editingId === t.id) return;
                        onDragStartTodo(t.id);
                      }}
                      onDragEnd={onDragEndTodo}
                      aria-label={`todo ${t.title}`}
                    >
                      {editingId === t.id ? (
                        <input
                          css={todoChipInputCss}
                          value={editingValue}
                          autoFocus
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitEdit(t.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          onMouseDown={(e) => {
                            // input 클릭이 드래그로 인식되지 않도록
                            e.stopPropagation();
                          }}
                          aria-label="edit todo"
                        />
                      ) : (
                        <span css={todoChipTitleCss}>{t.title}</span>
                      )}

                      <span
                        css={todoChipActionsCss}
                        data-actions="true"
                        aria-hidden={editingId === t.id}
                      >
                        <button
                          type="button"
                          css={todoChipActionBtnCss}
                          onMouseDown={(e) => {
                            // 버튼 클릭이 드래그 시작으로 이어지지 않게
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={() => startEdit(t)}
                        >
                          <img src={Edit} alt='edit'/>
                        </button> 
                        <button
                          type="button"
                          css={[todoChipActionBtnCss, todoChipActionBtnDangerCss]}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={() => deleteTodo(t.id)}
                        >
                          <img src={Trash} alt='delete'/>
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div css={todoFormCss}>
              <input
                css={todoInputCss}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTodo();
                }}
                placeholder="할 일을 입력하고 TimeLine에 드래그하세요"
                aria-label="todo input"
              />
              <button type="button" css={todoAddBtnCss} onClick={addTodo}>
                + ADD
              </button>
            </div>
          </div>

          {/* Right: 타임라인 */}
          <aside css={timelineCss} aria-label="timeline">
            <div css={timelineTitleCss}>TimeLine</div>

            {hours.map((hour, idx) => {
              const slotIndex = idx; // 6시가 0, 7시가 1 ...
              const scheduled = scheduledBySlot.get(slotIndex);
              const canDrop = draggingId !== null && !scheduled;

              return (
                <div key={hour} css={timelineSlotCss}>
                  <div css={timelineHourCss}>{hour}</div>
                  <div
                    css={timelineDropZoneCss}
                    data-can-drop={
                      hoverSlotIndex === slotIndex && canDrop ? 'true' : 'false'
                    }
                    onDragOver={(e) => {
                      
                      e.preventDefault();
                      setHoverSlotIndex(slotIndex);
                    }}
                    onDragLeave={() => {
                      setHoverSlotIndex((prev) => (prev === slotIndex ? null : prev));
                    }}
                    onDrop={() => {
                      if (!draggingId) return;
                      scheduleToSlot(draggingId, slotIndex);
                      onDragEndTodo();
                    }}
                    aria-label={`timeline slot ${hour}`}
                  >
                    {scheduled ? (
                      <div
                        css={todoChipBaseCss}
                        draggable
                        onDragStart={() => onDragStartTodo(scheduled.id)}
                        onDragEnd={onDragEndTodo}
                      >
                        {scheduled.title}
                      </div>
                    ) : (
                      <span style={{ color: 'rgba(0,0,0,0.25)', fontSize: 12 }}>
                        {canDrop ? 'drop' : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </aside>
        </div>
      </section>
    </main>
  );
}

