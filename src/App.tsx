import { Alert, Button, InputNumber, Progress, Radio } from "antd";
import React, { useReducer } from "react";
import "./App.css";

interface State {
  x: number;
  y: number;
  good: number;
  total: number;
  max: number;
  start?: number;
  now?: number;
  message?: string;
  status?: "success" | "error";
}

interface Action {
  type: string;
  value: number;
}

const initial: State = {
  x: 0,
  y: 0,
  good: 0,
  total: 0,
  max: 15,
};
const offset = 0.5;
const reducer = (state: State, { type, value }: Action): State => {
  const next = (max: number): { x: number; y: number } => {
    const x = Math.floor(
      max + 1 - offset - (max - 1 - offset) * Math.random() * Math.random()
    );
    const y = Math.floor(
      max + 1 - offset - (max - 1 - offset) * Math.random() * Math.random()
    );
    return x * y < 10 || (x === state.x && y === state.y)
      ? next(max)
      : { x, y };
  };

  const correct = state.x * state.y;
  switch (type) {
    case "reset":
      return initial;
    case "start":
      const now = Date.now();
      return { ...state, ...next(value), start: now, now, max: value };
    case "answer":
      // noinspection SuspiciousTypeOfGuard
      if (
        `${value}`.length !== `${correct}`.length ||
        typeof value !== "number"
      ) {
        return state;
      }

      return {
        ...state,
        ...next(state.max),
        good: state.good + (value === correct ? 1 : 0),
        total: state.total + 1,
        now: Date.now(),
        message: `${value === correct ? "Ja" : "Nee"}, het was ${correct}`,
        status: value === correct ? "success" : "error",
      };
    default:
      return state;
  }
};

function App() {
  const [
    { x, y, good, total, start, now, message, status, max },
    dispatch,
  ] = useReducer(reducer, initial);
  const time = total > 0 ? (now! - start!) / 1000 / total : 0;
  return (
    <main>
      <h1>Multimer {start && max}</h1>
      {!start && (
        <Radio.Group
          options={[
            { value: 10, label: "t/m 10" },
            { value: 15, label: "t/m 15" },
            { value: 20, label: "t/m 20" },
          ]}
          onChange={(e) =>
            dispatch({ type: "start", value: e.target.value as number })
          }
        />
      )}
      {start && (
        <>
          <strong>
            {x} x {y} ={" "}
          </strong>
          <InputNumber
            type="number"
            autoFocus
            key={total}
            min={10}
            maxLength={3}
            onChange={(v) => {
              dispatch({ type: "answer", value: v as number });
            }}
          />
          <br />
          {total > 0 && (
            <>
              <Alert message={message} type={status} />
              <span className="ib">
                <span>Juiste antwoorden</span>
                <br />
                <Progress
                  type="circle"
                  percent={Math.round((100 * good) / total)}
                  strokeColor="#52c41a"
                />
              </span>
              <span className="ib">
                <span>Antwoordtijd</span>
                <br />
                <Progress
                  type="circle"
                  percent={Math.min(100, Math.round(200 / time))}
                />
              </span>
              <br />
            </>
          )}
          <div>
            {total} antwoord{total !== 1 && "en"}
          </div>
          <Button
            type="default"
            onClick={() => dispatch({ type: "reset", value: 0 })}
          >
            Herstart
          </Button>
        </>
      )}
    </main>
  );
}

export default App;
