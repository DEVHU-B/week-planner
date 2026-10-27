import React, { useEffect, useMemo, useState } from "react";

const DAYS = [
  { id: "mon", short: "Пн", name: "Понедельник" },
  { id: "tue", short: "Вт", name: "Вторник" },
  { id: "wed", short: "Ср", name: "Среда" },
  { id: "thu", short: "Чт", name: "Четверг" },
  { id: "fri", short: "Пт", name: "Пятница" },
  { id: "sat", short: "Сб", name: "Суббота" },
  { id: "sun", short: "Вс", name: "Воскресенье" },
];

const STORAGE_KEY = "week-planner-tasks-v1";

const emptyTasks = Object.fromEntries(DAYS.map((day) => [day.id, []]));

function getInitialTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...emptyTasks, ...JSON.parse(saved) } : emptyTasks;
  } catch {
    return emptyTasks;
  }
}

export default function App() {
  const [tasks, setTasks] = useState(getInitialTasks);
  const [activeDay, setActiveDay] = useState(getTodayId);
  const [input, setInput] = useState("");

function getTodayId() {
  const dayIndex = new Date().getDay();

  const dayMap = {
    0: "sun", // Воскресенье
    1: "mon", // Понедельник
    2: "tue", // Вторник
    3: "wed", // Среда
    4: "thu", // Четверг
    5: "fri", // Пятница
    6: "sat", // Суббота
  };

  return dayMap[dayIndex];
}

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const day = DAYS.find((item) => item.id === activeDay);
  const currentTasks = tasks[activeDay];

  const stats = useMemo(() => {
    const all = Object.values(tasks).flat();
    const completed = all.filter((task) => task.completed).length;

    return {
      total: all.length,
      completed,
      percent: all.length ? Math.round((completed / all.length) * 100) : 0,
    };
  }, [tasks]);

  const addTask = (event) => {
    event.preventDefault();

    const title = input.trim();
    if (!title) return;

    const task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
    };

    setTasks((prev) => ({
      ...prev,
      [activeDay]: [...prev[activeDay], task],
    }));

    setInput("");
  };

  const toggleTask = (id) => {
    setTasks((prev) => ({
      ...prev,
      [activeDay]: prev[activeDay].map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      ),
    }));
  };

  const deleteTask = (id) => {
    setTasks((prev) => ({
      ...prev,
      [activeDay]: prev[activeDay].filter((task) => task.id !== id),
    }));
  };

  const clearCompleted = () => {
    setTasks((prev) => ({
      ...prev,
      [activeDay]: prev[activeDay].filter((task) => !task.completed),
    }));
  };

  const clearWeek = () => {
    if (!window.confirm("Удалить все задачи за неделю?")) return;
    setTasks(emptyTasks);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="eyebrow">WEEK PLANNER</div>
          <h1>План на неделю</h1>
          <p>Организуй задачи и контролируй прогресс.</p>
        </div>

        <button className="danger ghost" onClick={clearWeek}>
          Очистить неделю
        </button>
      </header>

      <main className="container">
        <section className="stats">
          <div className="stat">
            <span>Всего задач</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat">
            <span>Выполнено</span>
            <strong>{stats.completed}</strong>
          </div>
          <div className="stat progress-stat">
            <div className="progress-head">
              <span>Прогресс</span>
              <strong>{stats.percent}%</strong>
            </div>
            <div className="progress">
              <div style={{ width: `${stats.percent}%` }} />
            </div>
          </div>
        </section>

        <nav className="days" aria-label="Дни недели">
          {DAYS.map((item) => {
            const count = tasks[item.id].length;
            const done = tasks[item.id].filter((task) => task.completed).length;

            return (
              <button
                key={item.id}
                className={`day ${activeDay === item.id ? "active" : ""}`}
                onClick={() => setActiveDay(item.id)}
              >
                <span>{item.short}</span>
                <small>{count ? `${done}/${count}` : "—"}</small>
              </button>
            );
          })}
        </nav>

        <section className="planner">
          <div className="section-title">
            <div>
              <span className="eyebrow">TODAY'S PLAN</span>
              <h2>{day.name}</h2>
            </div>

            {currentTasks.some((task) => task.completed) && (
              <button className="clear-completed" onClick={clearCompleted}>
                Удалить выполненные
              </button>
            )}
          </div>

          <form className="task-form" onSubmit={addTask}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Например: изучить useEffect"
              aria-label="Новая задача"
            />
            <button type="submit">+ Добавить</button>
          </form>

          <div className="tasks">
            {currentTasks.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">✓</div>
                <h3>Задач пока нет</h3>
                <p>Добавь первую задачу на {day.name.toLowerCase()}.</p>
              </div>
            ) : (
              currentTasks.map((task) => (
                <article
                  key={task.id}
                  className={`task ${task.completed ? "completed" : ""}`}
                >
                  <button
                    className="check"
                    onClick={() => toggleTask(task.id)}
                    aria-label={task.completed ? "Отменить выполнение" : "Выполнить"}
                  >
                    {task.completed ? "✓" : ""}
                  </button>

                  <span className="task-title">{task.title}</span>

                  <button
                    className="delete"
                    onClick={() => deleteTask(task.id)}
                    aria-label="Удалить задачу"
                  >
                    ×
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      <footer>
        <span>Сохранение включено</span>
        <span>Данные хранятся в браузере</span>
      </footer>
    </div>
  );
}