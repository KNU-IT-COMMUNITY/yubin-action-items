import type { TodoItem } from '../types/todo';

const STORAGE_KEY = 'yubin.todosByDate.v1';

type TodosByDate = Record<string, TodoItem[]>;

function safeParse(raw: string | null): TodosByDate {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as TodosByDate;
  } catch {
    return {};
  }
}

export function loadTodosByDate(): TodosByDate {
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

export function saveTodosByDate(next: TodosByDate) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function loadDayTodos(dateKey: string): TodoItem[] {
  const all = loadTodosByDate();
  const items = all[dateKey];
  return Array.isArray(items) ? items : [];
}

export function saveDayTodos(dateKey: string, todos: TodoItem[]) {
  const all = loadTodosByDate();
  all[dateKey] = todos;
  saveTodosByDate(all);
}

