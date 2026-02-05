import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import ReactCalendar from 'react-calendar';
import ForwardIcon from '../assets/forward.svg';
import BackwardIcon from '../assets/backward.svg';

type Props = {
  /** 초기 선택 날짜(미지정 시 오늘) */
  initialDate?: Date;
  /** 날짜 선택 시 호출 (예: 선택한 날짜의 todo 페이지로 이동) */
  onSelectDate?: (date: Date) => void;
};

export default function CalendarCard({ initialDate, onSelectDate }: Props) {
  const base = useMemo(() => dayjs(initialDate ?? new Date()), [initialDate]);
  const today = useMemo(() => dayjs(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(base.toDate());
  const [activeStartDate, setActiveStartDate] = useState<Date>(base.startOf('month').toDate());

  const selectedDay = useMemo(() => dayjs(selectedDate), [selectedDate]);

  return (
    <div className="calendarCard" role="group" aria-label="calendar card">
      <p className="calendarCardHeadline">{selectedDay.format('ddd, MMM D')}</p>
      <div className="calendarDivider" />

      <ReactCalendar
        className="myCalendar"
        locale="en-US"
        prev2Label={null}
        next2Label={null}
        prevLabel={<img className="calendarNavIcon" src={BackwardIcon} alt="previous month" />}
        nextLabel={<img className="calendarNavIcon" src={ForwardIcon} alt="next month" />}
        value={selectedDate}
        onChange={(value) => {
          // react-calendar는 Date 또는 Date[]가 올 수 있어(범위 선택 모드).
          // 우리는 단일 날짜만 쓰니까 Date만 처리.
          if (value instanceof Date) {
            setSelectedDate(value);
            onSelectDate?.(value);
          }
        }}
        activeStartDate={activeStartDate}
        onActiveStartDateChange={({ activeStartDate: next }) => {
          if (next) setActiveStartDate(next);
        }}
        minDetail="month"
        maxDetail="month"
        showNeighboringMonth={false}
        formatShortWeekday={(_, date) => dayjs(date).format('dd')[0]}
        formatDay={(_, date) => dayjs(date).format('D')}
        tileClassName={({ date, view }) => {
          if (view !== 'month') return undefined;
          const d = dayjs(date);
          if (d.isSame(selectedDay, 'day')) return 'isSelected';
          if (d.isSame(today, 'day')) return 'isToday';
          return undefined;
        }}
      />
    </div>
  );
}

