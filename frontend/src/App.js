import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  const [overallPerformance, setOverallPerformance] = useState(null);
  const [coinPerformance, setCoinPerformance] = useState(null);
  const [loadingSignal, setLoadingSignal] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [error, setError] = useState("");

  const getSignalColor = (signal) => {
    if (signal === "BUY") return "#16a34a";
    if (signal === "SELL") return "#dc2626";
    return "#64748b";
  };

  const getStatusColor = (status) => {
    if (status === "TARGET HIT") return "#16a34a";
    if (status === "STOP HIT") return "#dc2626";
    if (status === "ACTIVE") return "#2563eb";
    return "#64748b";
  };

  const formatNumber = (value, digits = 2) => {
    if (value === null || value === undefined || value === "") return "-";
    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    });
  };

  const formatCurrency = (value, digits = 2) => {
    if (value === null || value === undefined || value === "") return "-";
    return `$${Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    })}`;
  };

  const formatSignalTime = (value) => {
    if (!value) return "-";
    const numeric = Number(value);
    if (!Number.isNaN(numeric) && `${numeric}`.length >= 10) {
      return new Date(numeric).toLocaleString();
    }
    return String(value);
  };

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/history`);
      if (!res.ok) {
        throw new Error("Failed to fetch history.");
      }
      const result = await res.json();
      setHistory(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setHistory([]);
    }
  }, []);

  const fetchOverallPerformance = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/performance`);
      if (!res.ok) {
        throw new Error("Failed to fetch overall performance.");
      }
      const result = await res.json();
      setOverallPerformance(result);
    } catch (err) {
      console.error("Error fetching overall performance:", err);
      setOverallPerformance(null);
    }
  }, []);

  const fetchCoinPerformance = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/performance/${coin}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch ${coin} performance.`);
      }
      const result = await res.json();
      setCoinPerformance(result);
    } catch (err) {
      console.error("Error fetching coin performance:", err);
      setCoinPerformance(null);
    }
  }, [coin]);

  const fetchSignal = async () => {
    try {
      setLoadingSignal(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/latest-signal/${coin}`);
      if (!response.ok) {
        throw new Error("Failed to fetch latest signal.");
      }

      const result = await response.json();
      setData(result);

      await Promise.all([
        fetchHistory(),
        fetchOverallPerformance(),
        fetchCoinPerformance(),
      ]);
    } catch (err) {
      console.error("Fetch signal error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoadingSignal(false);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoadingDashboard(true);
        await Promise.all([
          fetchHistory(),
          fetchOverallPerformance(),
          fetchCoinPerformance(),
        ]);
      } finally {
        setLoadingDashboard(false);
      }
    };

    loadDashboard();
  }, [fetchHistory, fetchOverallPerformance, fetchCoinPerformance]);

  const latestChartData = useMemo(() => {
    return (
      data?.recent_prices?.map((price, index) => ({
        step: index + 1,
        price: Number(price),
      })) || []
    );
  }, [data]);

  const overallEquityData = useMemo(() => {
    return (overallPerformance?.equity_curve || []).map((value, index) => ({
      step: index + 1,
      equity: value,
    }));
  }, [overallPerformance]);

  const coinEquityData = useMemo(() => {
    return (coinPerformance?.equity_curve || []).map((value, index) => ({
      step: index + 1,
      equity: value,
    }));
  }, [coinPerformance]);

  const appStyle = {
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    padding: "32px 16px",
    fontFamily: "Arial, sans-serif",
  };

  const containerStyle = {
    maxWidth: "1200px",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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

  const kpiGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "14px",
  };

  const darkCardStyle = {
    background: "#111827",
    borderRadius: "14px",
    padding: "16px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  };

  const cardLabel = {
    fontSize: "12px",
    color: "#9ca3af",
    marginBottom: "6px",
  };

  const cardValue = {
    fontSize: "22px",
    fontWeight: "700",
    color: "#ffffff",
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
            Production-ready crypto signal dashboard with live signals,
            performance analytics, and recent trade history.
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
              disabled={loadingSignal}
            >
              {loadingSignal ? "Loading..." : `Get ${coin} Signal`}
            </button>
          </div>

          {error && (
            <p style={{ color: "#dc2626", marginTop: "14px", marginBottom: 0 }}>
              {error}
            </p>
          )}
        </div>

        {overallPerformance && (
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <h2 style={sectionTitleStyle}>Overall Strategy Performance</h2>
              <span
                style={{
                  ...badgeBaseStyle,
                  backgroundColor: "#0f172a",
                }}
              >
                ALL COINS
              </span>
            </div>

            <div style={kpiGridStyle}>
              <div style={darkCardStyle}>
                <div style={cardLabel}>Total Trades</div>
                <div style={cardValue}>{overallPerformance.total_trades}</div>
              </div>

              <div style={darkCardStyle}>
                <div style={cardLabel}>Wins</div>
                <div style={{ ...cardValue, color: "#22c55e" }}>
                  {overallPerformance.wins}
                </div>
              </div>

              <div style={darkCardStyle}>
                <div style={cardLabel}>Losses</div>
                <div style={{ ...cardValue, color: "#ef4444" }}>
                  {overallPerformance.losses}
                </div>
              </div>

              <div style={darkCardStyle}>
                <div style={cardLabel}>Win Rate</div>
                <div style={{ ...cardValue, color: "#38bdf8" }}>
                  {formatNumber(overallPerformance.win_rate)}%
                </div>
              </div>

              <div style={darkCardStyle}>
                <div style={cardLabel}>Profit %</div>
                <div style={{ ...cardValue, color: "#22c55e" }}>
                  {formatNumber(overallPerformance.total_profit_pct)}%
                </div>
              </div>

              <div style={darkCardStyle}>
                <div style={cardLabel}>Avg RR</div>
                <div style={{ ...cardValue, color: "#a78bfa" }}>
                  {formatNumber(overallPerformance.avg_rr)}
                </div>
              </div>
            </div>

            <div style={chartWrapperStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overallEquityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="equity"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

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
                <div style={valueStyle}>{formatCurrency(data.current_price, 4)}</div>
              </div>

              <div style={statCardStyle}>
                <div style={labelStyle}>Entry</div>
                <div style={valueStyle}>{formatCurrency(data.entry, 4)}</div>
              </div>

              <div style={statCardStyle}>
                <div style={labelStyle}>Stop</div>
                <div style={valueStyle}>{formatCurrency(data.stop, 4)}</div>
              </div>

              <div style={statCardStyle}>
                <div style={labelStyle}>Target</div>
                <div style={valueStyle}>{formatCurrency(data.target, 4)}</div>
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
              <strong>Signal Time:</strong> {formatSignalTime(data.signal_time)}
            </div>

            <div style={chartWrapperStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latestChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" />
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

        {coinPerformance && (
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <h2 style={sectionTitleStyle}>Selected Coin Performance</h2>
              <span
                style={{
                  ...badgeBaseStyle,
                  backgroundColor: "#2563eb",
                }}
              >
                {coinPerformance.coin || coin}
              </span>
            </div>

            <div style={kpiGridStyle}>
              <div style={darkCardStyle}>
                <div style={cardLabel}>Total Trades</div>
                <div style={cardValue}>{coinPerformance.total_trades}</div>
              </div>

              <div style={darkCardStyle}>
                <div style={cardLabel}>Wins</div>
                <div style={{ ...cardValue, color: "#22c55e" }}>
                  {coinPerformance.wins}
                </div>
              </div>

              <div style={darkCardStyle}>
                <div style={cardLabel}>Losses</div>
                <div style={{ ...cardValue, color: "#ef4444" }}>
                  {coinPerformance.losses}
                </div>
              </div>

              <div style={darkCardStyle}>
                <div style={cardLabel}>Win Rate</div>
                <div style={{ ...cardValue, color: "#38bdf8" }}>
                  {formatNumber(coinPerformance.win_rate)}%
                </div>
              </div>

              <div style={darkCardStyle}>
                <div style={cardLabel}>Profit %</div>
                <div style={{ ...cardValue, color: "#22c55e" }}>
                  {formatNumber(coinPerformance.total_profit_pct)}%
                </div>
              </div>

              <div style={darkCardStyle}>
                <div style={cardLabel}>Avg RR</div>
                <div style={{ ...cardValue, color: "#a78bfa" }}>
                  {formatNumber(coinPerformance.avg_rr)}
                </div>
              </div>
            </div>

            <div style={chartWrapperStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={coinEquityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="equity"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h2 style={sectionTitleStyle}>Recent Signal History</h2>
            <span
              style={{
                ...badgeBaseStyle,
                backgroundColor: "#0f172a",
              }}
            >
              ALL COINS
            </span>
          </div>

          {loadingDashboard ? (
            <p style={emptyTextStyle}>Loading dashboard data...</p>
          ) : history.length === 0 ? (
            <p style={emptyTextStyle}>No signals saved yet.</p>
          ) : (
            <div style={historyGridStyle}>
              {history.map((item) => (
                <div key={item.id} style={historyCardStyle}>
                  <div style={historyTopRowStyle}>
                    <div style={historyCoinStyle}>
                      {item.requested_coin} → {item.coin_used}
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          ...badgeBaseStyle,
                          backgroundColor: getSignalColor(item.signal),
                        }}
                      >
                        {item.signal}
                      </span>

                      <span
                        style={{
                          ...badgeBaseStyle,
                          backgroundColor: getStatusColor(item.status),
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div style={historyRowStyle}>
                    <strong>Current Price:</strong> {formatCurrency(item.current_price, 4)}
                  </div>

                  <div style={historyRowStyle}>
                    <strong>Entry:</strong> {formatCurrency(item.entry, 4)} |{" "}
                    <strong>Stop:</strong> {formatCurrency(item.stop, 4)} |{" "}
                    <strong>Target:</strong> {formatCurrency(item.target, 4)}
                  </div>

                  <div style={historyRowStyle}>
                    <strong>Confidence:</strong> {item.confidence || "-"} |{" "}
                    <strong>Interval:</strong> {item.interval || "-"}
                  </div>

                  <div style={historyRowStyle}>
                    <strong>Candles Ago:</strong>{" "}
                    {item.candles_ago !== null && item.candles_ago !== undefined
                      ? item.candles_ago
                      : "-"}{" "}
                    | <strong>RR:</strong> {formatNumber(item.rr)}
                  </div>

                  <div style={mutedTextStyle}>
                    <strong>Signal Time:</strong> {formatSignalTime(item.signal_time)}
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