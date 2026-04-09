import { useState } from "react";
import { Calculator as CalcIcon, Delete } from "lucide-react";

export function Calculator() {
  const [display, setDisplay] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleInput = (val: string) => {
    setDisplay((prev) => prev + val);
  };

  const calculate = () => {
    try {
      // Using a safe evaluation approach for simple math
      const result = new Function("return " + display)();
      setDisplay(String(result));
    } catch (e) {
      setDisplay("Erro");
      setTimeout(() => setDisplay(""), 1500);
    }
  };

  const clear = () => setDisplay("");

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-all z-50 flex items-center gap-2"
      >
        <CalcIcon size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-64 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
      <div className="flex justify-between items-center bg-slate-900 p-3 border-b border-slate-700">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold">
          <CalcIcon size={18} />
          <span>Calculadora</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white"
        >
          &times;
        </button>
      </div>
      
      <div className="p-4">
        <div className="w-full bg-slate-900 text-right p-3 rounded-lg mb-4 text-xl font-mono text-slate-100 min-h-[52px] break-all">
          {display || "0"}
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {["7", "8", "9", "/"].map((btn) => (
            <button key={btn} onClick={() => handleInput(btn)} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-slate-200">
              {btn}
            </button>
          ))}
          {["4", "5", "6", "*"].map((btn) => (
            <button key={btn} onClick={() => handleInput(btn)} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-slate-200">
              {btn}
            </button>
          ))}
          {["1", "2", "3", "-"].map((btn) => (
            <button key={btn} onClick={() => handleInput(btn)} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-slate-200">
              {btn}
            </button>
          ))}
          <button onClick={clear} className="p-3 bg-red-900/50 text-red-400 hover:bg-red-900/80 rounded-lg font-semibold">
            C
          </button>
          <button onClick={() => handleInput("0")} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-slate-200">
            0
          </button>
          <button onClick={() => handleInput(".")} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-slate-200">
            .
          </button>
          <button onClick={() => handleInput("+")} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-slate-200">
            +
          </button>
          <button onClick={calculate} className="col-span-4 p-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-white mt-2">
            =
          </button>
        </div>
      </div>
    </div>
  );
}
