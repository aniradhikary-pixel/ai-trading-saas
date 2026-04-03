import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE_URL = "https://ai-trading-saas-production.up.railway.app";

function App() {
  const [coin, setCoin] = useState("BTC");
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
  fetchHistory();
  fetchPerformance();
  }, [coin]);

  const cardStyle = {
    background: "#111827",
    borderRadius: "12px",
    padding: "15px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
  };

  const cardLabel = {
    fontSize: "12px",
    color: "#9ca3af",
    marginBottom: "5px"
  };

  const cardValue = {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#fff"
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/history/${coin}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const fetchPerformance = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/performance/${coin}`);
      const data = await res.json();
      setPerformance(data);
    } catch (err) {
      console.error("Error fetching performance:", err);
    }
  };

  const getSignalColor = (signal) => {
    if (signal === "BUY") return "#16a34a";
    if (signal === "SELL") return "#dc2626";
    return "#64748b";
  };

  const fetchSignal = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/signal/${coin}`);

      if (!response.ok) {
        throw new Error("Failed to fetch signal from backend.");
      }

      const result = await response.json();
      setData(result);
      await fetchHistory();
      await fetchPerformance();

      
    } catch (err) {
      setError(err.message || "Something went wrong.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    alert("History is stored on server. Cannot clear from frontend.");
  };

  const chartData =
    data?.recent_prices?.map((price, index) => ({
      index: index + 1,
      price: Number(price),
    })) || [];

  const appStyle = {
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    padding: "32px 16px",
    fontFamily: "Arial, sans-serif",
  };

  const containerStyle = {
    maxWidth: "1100px",
    margin: "0 auto",
  };

  const headerStyle = {
    marginBottom: "24px",
  };

  const titleStyle = {
    margin: 0,
    fontSize: "32px",
    fontWeight: "700",
    color: "#0f172a",
  };

  const subtitleStyle = {
    marginTop: "8px",
    color: "#475569",
    fontSize: "15px",
  };

  const controlPanelStyle = {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
    marginBottom: "24px",
  };

  const controlRowStyle = {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  };

  const selectStyle = {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    minWidth: "140px",
    backgroundColor: "#ffffff",
  };

  const primaryButtonStyle = {
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
  };

  const secondaryButtonStyle = {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    fontWeight: "600",
    color: "#334155",
  };

  const panelStyle = {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
    marginBottom: "24px",
  };

  const panelHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "16px",
  };

  const sectionTitleStyle = {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
  };

  const signalGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginTop: "16px",
  };

  const statCardStyle = {
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "16px",
    backgroundColor: "#f8fafc",
  };

  const labelStyle = {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "8px",
    fontWeight: "600",
  };

  const valueStyle = {
    fontSize: "18px",
    color: "#0f172a",
    fontWeight: "700",
  };

  const badgeBaseStyle = {
    color: "#ffffff",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.3px",
    display: "inline-block",
  };

  const chartWrapperStyle = {
    width: "100%",
    height: "320px",
    marginTop: "18px",
  };

  const historyGridStyle = {
    display: "grid",
    gap: "14px",
  };

  const historyCardStyle = {
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "16px",
    backgroundColor: "#f8fafc",
  };

  const historyTopRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "10px",
  };

  const historyCoinStyle = {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
  };

  const historyRowStyle = {
    fontSize: "14px",
    color: "#334155",
    lineHeight: 1.7,
  };

  const mutedTextStyle = {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "6px",
  };

  const emptyTextStyle = {
    color: "#64748b",
    fontSize: "14px",
    margin: 0,
  };

  return (
    <div style={appStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>AI Crypto Trading Dashboard</h1>
          <div style={subtitleStyle}>
            Live signal view with chart and saved history
          </div>
        </div>

        <div style={controlPanelStyle}>
          <div style={controlRowStyle}>
            <select
              value={coin}
              onChange={(e) => setCoin(e.target.value)}
              style={selectStyle}
            >
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="SOL">SOL</option>
            </select>

            <button
              onClick={fetchSignal}
              style={primaryButtonStyle}
              disabled={loading}
            >
              {loading ? "Loading..." : "Get Signal"}
            </button>
          </div>

          {error && (
            <p style={{ color: "#dc2626", marginTop: "14px", marginBottom: 0 }}>
              {error}
            </p>
          )}
        </div>

        {data && (
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <h2 style={sectionTitleStyle}>Latest Signal</h2>

              <span
                style={{
                  ...badgeBaseStyle,
                  backgroundColor: getSignalColor(data.signal),
                }}
              >
                {data.signal || "HOLD"}
              </span>
            </div>

            <div style={signalGridStyle}>
              <div style={statCardStyle}>
                <div style={labelStyle}>Requested Coin</div>
                <div style={valueStyle}>{data.requested_coin || coin}</div>
              </div>

              <div style={statCardStyle}>
                <div style={labelStyle}>Coin Used</div>
                <div style={valueStyle}>{data.coin_used || coin}</div>
              </div>

              <div style={statCardStyle}>
                <div style={labelStyle}>Current Price</div>
                <div style={valueStyle}>
                  ${Number(data.current_price || 0).toLocaleString()}
                </div>
              </div>

              <div style={statCardStyle}>
                <div style={labelStyle}>Entry</div>
                <div style={valueStyle}>
                  ${Number(data.entry || 0).toLocaleString()}
                </div>
              </div>

              <div style={statCardStyle}>
                <div style={labelStyle}>Stop</div>
                <div style={valueStyle}>
                  ${Number(data.stop || 0).toLocaleString()}
                </div>
              </div>

              <div style={statCardStyle}>
                <div style={labelStyle}>Target</div>
                <div style={valueStyle}>
                  ${Number(data.target || 0).toLocaleString()}
                </div>
              </div>

              <div style={statCardStyle}>
                <div style={labelStyle}>Status</div>
                <div style={valueStyle}>{data.status || "UNKNOWN"}</div>
              </div>

              <div style={statCardStyle}>
                <div style={labelStyle}>Confidence</div>
                <div style={valueStyle}>{data.confidence || "N/A"}</div>
              </div>

              <div style={statCardStyle}>
                <div style={labelStyle}>Interval</div>
                <div style={valueStyle}>{data.interval || "-"}</div>
              </div>

              <div style={statCardStyle}>
                <div style={labelStyle}>Candles Ago</div>
                <div style={valueStyle}>
                  {data.candles_ago !== null && data.candles_ago !== undefined
                    ? data.candles_ago
                    : "-"}
                </div>
              </div>
            </div>

            <div style={{ ...mutedTextStyle, marginTop: "16px" }}>
              <strong>Signal Time:</strong>{" "}
              {data.signal_time ? new Date(data.signal_time).toLocaleString() : "-"}
            </div>

            <div style={chartWrapperStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {performance && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "15px",
            marginBottom: "20px"
          }}>
                        
            {/* Total Trades */}
            <div style={cardStyle}>
              <div style={cardLabel}>Total Trades</div>
              <div style={cardValue}>{performance.total_trades}</div>
            </div>

            {/* Wins */}
            <div style={cardStyle}>
              <div style={cardLabel}>Wins</div>
              <div style={{ ...cardValue, color: "#22c55e" }}>
                {performance.wins}
              </div>
            </div>

            {/* Losses */}
            <div style={cardStyle}>
              <div style={cardLabel}>Losses</div>
              <div style={{ ...cardValue, color: "#ef4444" }}>
                {performance.losses}
              </div>
            </div>

            {/* Win Rate */}
            <div style={cardStyle}>
              <div style={cardLabel}>Win Rate</div>
              <div style={{ ...cardValue, color: "#38bdf8" }}>
              {performance.win_rate}%
              </div>
            </div>
           
            <div style={cardStyle}>
              <div style={cardLabel}>Profit %</div>
              <div style={{ ...cardValue, color: "#22c55e" }}>
                {performance.total_profit_pct}%
              </div>
            </div>

            {/* Avg RR */}
            <div style={cardStyle}>
              <div style={cardLabel}>Avg RR</div>
              <div style={{ ...cardValue, color: "#a78bfa" }}>
                {performance.avg_rr}
              </div>
            </div>
            
            <h3 style={{ marginTop: "20px" }}>Equity Curve</h3>

            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart
                  data={performance.equity_curve.map((value, index) => ({
                    step: index + 1,
                    equity: value
                  }))}
                >
                  <XAxis dataKey="step" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="equity" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>
        )}

        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h2 style={sectionTitleStyle}>Signal History</h2>

            <button onClick={clearHistory} style={secondaryButtonStyle}>
              Clear History
            </button>
          </div>

          {history.length === 0 ? (
            <p style={emptyTextStyle}>No signals saved yet.</p>
          ) : (
            <div style={historyGridStyle}>
              {history.map((item) => (
                <div key={item.id} style={historyCardStyle}>
                  <div style={historyTopRowStyle}>
                    <div style={historyCoinStyle}>
                      {item.requested_coin} → {item.coin_used}
                    </div>

                    <span
                      style={{
                        ...badgeBaseStyle,
                        backgroundColor: getSignalColor(item.signal),
                      }}
                    >
                      {item.signal}
                    </span>
                  </div>

                  <div style={historyRowStyle}>
                    <strong>Current Price:</strong> $
                    {Number(item.current_price || 0).toLocaleString()}
                  </div>

                  <div style={historyRowStyle}>
                    <strong>Entry:</strong> $
                    {Number(item.entry || 0).toLocaleString()} |{" "}
                    <strong>Stop:</strong> $
                    {Number(item.stop || 0).toLocaleString()} |{" "}
                    <strong>Target:</strong> $
                    {Number(item.target || 0).toLocaleString()}
                  </div>

                  <div style={historyRowStyle}>
                    <strong>Status:</strong> {item.status} |{" "}
                    <strong>Confidence:</strong> {item.confidence}
                  </div>
                  
                  <div style={historyRowStyle}>
                    <strong>Interval:</strong> {item.interval || "-"} |{" "}
                    <strong>Candles Ago:</strong>{" "}
                    {item.candles_ago !== null && item.candles_ago !== undefined
                      ? item.candles_ago
                      : "-"}
                  </div>
                  
                  <div style={mutedTextStyle}>
                    <strong>Signal Time:</strong>{" "}
                    {item.signal_time ? new Date(item.signal_time).toLocaleString() : "-"}
                  </div>

                  <div style={{ ...mutedTextStyle, color: "#94a3b8" }}>
                    <strong>Fetched At:</strong> {item.fetched_at || "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;