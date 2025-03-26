import React, { useState, useRef, useEffect } from "react";
import "./Calculator.css";

export default function Calculator() {
  const [mode, setMode] = useState("standard");
  const [showSidebar, setShowSidebar] = useState(false);
  const [standardExpr, setStandardExpr] = useState("");
  const [standardResult, setStandardResult] = useState("");
  const [scientificExpr, setScientificExpr] = useState("");
  const [scientificResult, setScientificResult] = useState("");
  const [graphExpr, setGraphExpr] = useState("x^2");
  const graphCanvasRef = useRef(null);
  const [programmerValue, setProgrammerValue] = useState("0");
  const [programmerBase, setProgrammerBase] = useState("10");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [dateDiff, setDateDiff] = useState("");
  const [converterCategory, setConverterCategory] = useState("length");
  const [converterFromUnit, setConverterFromUnit] = useState("m");
  const [converterToUnit, setConverterToUnit] = useState("ft");
  const [converterInput, setConverterInput] = useState("");
  const [converterResult, setConverterResult] = useState("");

  const handleStandardButtonClick = (val) => {
    if (val === "C") {
      setStandardExpr("");
      setStandardResult("");
      return;
    }
    if (val === "=") {
      try {
        const r = eval(standardExpr);
        setStandardResult(r.toString());
      } catch {
        setStandardResult("Error");
      }
      return;
    }
    setStandardExpr((prev) => prev + val);
  };

  const handleScientificButtonClick = (val) => {
    if (val === "C") {
      setScientificExpr("");
      setScientificResult("");
      return;
    }
    if (val === "=") {
      try {
        const r = eval(scientificExpr);
        setScientificResult(r.toString());
      } catch {
        setScientificResult("Error");
      }
      return;
    }
    setScientificExpr((prev) => prev + val);
  };

  useEffect(() => {
    if (mode !== "graphing") return;
    drawGraph();
  }, [mode, graphExpr]);

  const drawGraph = () => {
    if (!graphCanvasRef.current) return;
    const ctx = graphCanvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 400, 300);
    ctx.strokeStyle = "#666";
    ctx.beginPath();
    ctx.moveTo(0, 150);
    ctx.lineTo(400, 150);
    ctx.moveTo(200, 0);
    ctx.lineTo(200, 300);
    ctx.stroke();
    ctx.strokeStyle = "#00f";
    ctx.beginPath();
    let first = true;
    for (let px = 0; px <= 400; px++) {
      const x = (px - 200) / 20;
      let yVal = 0;
      try {
        yVal = eval(graphExpr.toLowerCase().replace("^", "**"));
      } catch {
        yVal = 0;
      }
      const py = 150 - yVal * 20;
      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
  };

  const handleProgrammerChange = (e) => {
    setProgrammerValue(e.target.value);
  };
  const convertProgrammerValue = () => {
    let decimal = 0;
    try {
      if (programmerBase === "10") {
        decimal = parseInt(programmerValue, 10);
      } else if (programmerBase === "2") {
        decimal = parseInt(programmerValue, 2);
      } else if (programmerBase === "16") {
        decimal = parseInt(programmerValue, 16);
      } else if (programmerBase === "8") {
        decimal = parseInt(programmerValue, 8);
      }
    } catch {
      decimal = 0;
    }
    if (isNaN(decimal)) decimal = 0;
    return {
      bin: (decimal >>> 0).toString(2),
      oct: (decimal >>> 0).toString(8),
      dec: (decimal >>> 0).toString(10),
      hex: (decimal >>> 0).toString(16).toUpperCase(),
    };
  };

  const handleDateDiff = () => {
    if (!date1 || !date2) {
      setDateDiff("");
      return;
    }
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffMs = Math.abs(d2 - d1);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    setDateDiff(`${diffDays} day(s)`);
  };

  const unitData = {
    length: {
      m: { label: "Meter", factor: 1 },
      ft: { label: "Foot", factor: 3.28084 },
      in: { label: "Inch", factor: 39.3701 },
      km: { label: "Kilometer", factor: 0.001 },
    },
    weight: {
      kg: { label: "Kilogram", factor: 1 },
      lb: { label: "Pound", factor: 2.20462 },
      g: { label: "Gram", factor: 1000 },
    },
    temperature: {
      c: { label: "Celsius" },
      f: { label: "Fahrenheit" },
    },
    currency: {
      usd: { label: "USD", factor: 1 },
      inr: { label: "INR", factor: 82 },
      eur: { label: "EUR", factor: 0.92 },
    },
  };

  const handleConvert = () => {
    let inputVal = parseFloat(converterInput) || 0;
    if (!unitData[converterCategory]) return;
    if (converterCategory === "temperature") {
      if (converterFromUnit === "c" && converterToUnit === "f") {
        setConverterResult(((inputVal * 9) / 5 + 32).toString());
      } else if (converterFromUnit === "f" && converterToUnit === "c") {
        setConverterResult((((inputVal - 32) * 5) / 9).toString());
      } else {
        setConverterResult(inputVal.toString());
      }
    } else {
      const fromFactor = unitData[converterCategory][converterFromUnit]?.factor || 1;
      const toFactor = unitData[converterCategory][converterToUnit]?.factor || 1;
      const baseVal = inputVal / fromFactor;
      const result = baseVal * toFactor;
      setConverterResult(result.toString());
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const { key } = e;
      if (mode === "standard") {
        if (/[0-9+\-*/.]/.test(key)) {
          setStandardExpr((prev) => prev + key);
        } else if (key === "Enter") {
          e.preventDefault();
          try {
            const r = eval(standardExpr);
            setStandardResult(r.toString());
          } catch {
            setStandardResult("Error");
          }
        } else if (key === "Backspace") {
          e.preventDefault();
          setStandardExpr((prev) => prev.slice(0, -1));
        } else if (key === "Escape") {
          setStandardExpr("");
          setStandardResult("");
        }
      }
      if (mode === "scientific") {
        if (/[0-9+\-*/.()^]/.test(key)) {
          setScientificExpr((prev) => prev + key);
        } else if (key === "Enter") {
          e.preventDefault();
          try {
            const r = eval(scientificExpr);
            setScientificResult(r.toString());
          } catch {
            setScientificResult("Error");
          }
        } else if (key === "Backspace") {
          e.preventDefault();
          setScientificExpr((prev) => prev.slice(0, -1));
        } else if (key === "Escape") {
          setScientificExpr("");
          setScientificResult("");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, standardExpr, scientificExpr]);

  return (
    <div className="calc-container-outer">
      <button className="hamburger-btn1" onClick={() => setShowSidebar((prev) => !prev)}>
        ☰
      </button>
      <div className={`calc-sidebar ${showSidebar ? "open" : ""}`}>
        <h2>Calculator</h2>
        <ul>
          <li onClick={() => { setMode("standard"); setShowSidebar(false); }} className={mode === "standard" ? "active" : ""}>
            Standard
          </li>
          <li onClick={() => { setMode("scientific"); setShowSidebar(false); }} className={mode === "scientific" ? "active" : ""}>
            Scientific
          </li>
          <li onClick={() => { setMode("graphing"); setShowSidebar(false); }} className={mode === "graphing" ? "active" : ""}>
            Graphing
          </li>
          <li onClick={() => { setMode("programmer"); setShowSidebar(false); }} className={mode === "programmer" ? "active" : ""}>
            Programmer
          </li>
          <li onClick={() => { setMode("date"); setShowSidebar(false); }} className={mode === "date" ? "active" : ""}>
            Date
          </li>
          <li onClick={() => { setMode("converter"); setShowSidebar(false); }} className={mode === "converter" ? "active" : ""}>
            Converter
          </li>
        </ul>
      </div>
      <div className="calc-main">
        {mode === "standard" && (
          <div className="calc-mode">
            <h3>Standard</h3>
            <div className="std-display">
              <div className="expr-display">{standardExpr}</div>
              <div className="result-display">{standardResult}</div>
            </div>
            <div className="std-keys">
              {["7","8","9","/","4","5","6","*","1","2","3","-","0",".","=","+","C"].map((val) => (
                <button key={val} onClick={() => handleStandardButtonClick(val)}>
                  {val}
                </button>
              ))}
            </div>
          </div>
        )}
        {mode === "scientific" && (
          <div className="calc-mode">
            <h3>Scientific</h3>
            <div className="sci-display">
              <div className="expr-display">{scientificExpr}</div>
              <div className="result-display">{scientificResult}</div>
            </div>
            <div className="sci-keys">
              {[
                "sin(","cos(","tan(","^","sqrt(","log(","ln(","(",")","pi","C",
                "7","8","9","/","4","5","6","*","1","2","3","-","0",".","=","+"
              ].map((val) => (
                <button key={val} onClick={() => handleScientificButtonClick(val)}>
                  {val}
                </button>
              ))}
            </div>
          </div>
        )}
        {mode === "graphing" && (
          <div className="calc-mode">
            <h3>Graphing</h3>
            <p>Enter expression (x^2, sin(x), etc.)</p>
            <input
              type="text"
              value={graphExpr}
              onChange={(e) => setGraphExpr(e.target.value)}
              style={{ width: "80%", marginBottom: "10px" }}
            />
            <div className="graph-container">
              <canvas
                ref={graphCanvasRef}
                width={400}
                height={300}
                style={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
              ></canvas>
            </div>
          </div>
        )}
        {mode === "programmer" && (
          <div className="calc-mode">
            <h3>Programmer</h3>
            <p>Value in base {programmerBase}:</p>
            <input
              type="text"
              value={programmerValue}
              onChange={handleProgrammerChange}
              style={{ marginRight: "10px" }}
            />
            <select value={programmerBase} onChange={(e) => setProgrammerBase(e.target.value)}>
              <option value="2">Binary</option>
              <option value="8">Octal</option>
              <option value="10">Decimal</option>
              <option value="16">Hex</option>
            </select>
            <div className="prog-results">
              <p>BIN: {convertProgrammerValue().bin}</p>
              <p>OCT: {convertProgrammerValue().oct}</p>
              <p>DEC: {convertProgrammerValue().dec}</p>
              <p>HEX: {convertProgrammerValue().hex}</p>
            </div>
          </div>
        )}
        {mode === "date" && (
          <div className="calc-mode">
            <h3>Date Calculation</h3>
            <label>From: <input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} /></label>
            <br />
            <label>To: <input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} /></label>
            <br />
            <button onClick={handleDateDiff} style={{ marginTop: "10px" }}>
              Calculate
            </button>
            <p>{dateDiff}</p>
          </div>
        )}
        {mode === "converter" && (
          <div className="calc-mode">
            <h3>Converter</h3>
            <p>Select Category:</p>
            <select
              value={converterCategory}
              onChange={(e) => {
                setConverterCategory(e.target.value);
              }}
            >
              <option value="currency">Currency</option>
              <option value="length">Length</option>
              <option value="weight">Weight</option>
              <option value="temperature">Temperature</option>
            </select>
            <div className="converter-row">
              <div>
                <p>From:</p>
                <select
                  value={converterFromUnit}
                  onChange={(e) => setConverterFromUnit(e.target.value)}
                >
                  {renderUnitOptions(converterCategory)}
                </select>
              </div>
              <div>
                <p>To:</p>
                <select
                  value={converterToUnit}
                  onChange={(e) => setConverterToUnit(e.target.value)}
                >
                  {renderUnitOptions(converterCategory)}
                </select>
              </div>
            </div>
            <div className="converter-inputs">
              <input
                type="number"
                value={converterInput}
                onChange={(e) => setConverterInput(e.target.value)}
              />
              <button onClick={handleConvert}>Convert</button>
            </div>
            <p className="converter-result">Result: {converterResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function renderUnitOptions(category) {
  if (category === "currency") {
    return (
      <>
        <option value="usd">USD</option>
        <option value="inr">INR</option>
        <option value="eur">EUR</option>
      </>
    );
  } else if (category === "length") {
    return (
      <>
        <option value="m">Meter</option>
        <option value="ft">Foot</option>
        <option value="in">Inch</option>
        <option value="km">Kilometer</option>
      </>
    );
  } else if (category === "weight") {
    return (
      <>
        <option value="kg">Kilogram</option>
        <option value="lb">Pound</option>
        <option value="g">Gram</option>
      </>
    );
  } else if (category === "temperature") {
    return (
      <>
        <option value="c">Celsius</option>
        <option value="f">Fahrenheit</option>
      </>
    );
  }
  return null;
}
