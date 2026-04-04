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
const TELEGRAM_BOT_URL = "https://t.me/AICryptoTradingSignal_bot?start=free";
const TELEGRAM_CONTACT_URL = "https://t.me/Anir3103";

function App() {
  const [coin, setCoin] = useState("BTC");
  const [latestSignal, setLatestSignal] = useState(null);
  const [history, setHistory] = useState([]);
  const [overallPerformance, setOverallPerformance] = useState(null);
  const [coinPerformance, setCoinPerformance] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [error, setError] = useState("");

  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadMessage, setLeadMessage] = useState("");

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

  const openSubscribeModal = () => {
    setLeadMessage("");
    setShowSubscribeModal(true);
  };

  const handleSubscribeFree = async (e) => {
    e.preventDefault();

    if (!leadName.trim() || !leadEmail.trim()) {
      setLeadMessage("Please enter your name and email.");
      return;
    }

    try {
      setSubmittingLead(true);
      setLeadMessage("");

      const res = await fetch(`${API_BASE_URL}/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: leadName,
          email: leadEmail,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save your details.");
      }

      const data = await res.json();

      setLeadMessage("Details saved. Redirecting to Telegram...");

      setTimeout(() => {
        window.open(data.telegram_bot_url || TELEGRAM_BOT_URL, "_blank");
        setShowSubscribeModal(false);
        setLeadName("");
        setLeadEmail("");
        setLeadMessage("");
      }, 1200);
    } catch (err) {
      setLeadMessage(err.message || "Something went wrong.");
    } finally {
      setSubmittingLead(false);
    }
  };

  const fetchLatestSignal = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/latest-signal/${coin}`);
      if (!res.ok) throw new Error(`Failed to fetch latest ${coin} signal.`);
      const result = await res.json();
      setLatestSignal(result && Object.keys(result).length ? result : null);
    } catch (err) {
      console.error("Error fetching latest signal:", err);
      setLatestSignal(null);
    }
  }, [coin]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/history`);
      if (!res.ok) throw new Error("Failed to fetch history.");
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
      if (!res.ok) throw new Error("Failed to fetch overall performance.");
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
      if (!res.ok) throw new Error(`Failed to fetch ${coin} performance.`);
      const result = await res.json();
      setCoinPerformance(result);
    } catch (err) {
      console.error("Error fetching coin performance:", err);
      setCoinPerformance(null);
    }
  }, [coin]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics`);
      if (!res.ok) throw new Error("Failed to fetch analytics.");
      const result = await res.json();
      setAnalytics(result);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setAnalytics(null);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      setError("");
      await Promise.all([
        fetchLatestSignal(),
        fetchHistory(),
        fetchOverallPerformance(),
        fetchCoinPerformance(),
        fetchAnalytics(),
      ]);
    } catch (err) {
      setError("Failed to load dashboard data.");
    }
  }, [
    fetchLatestSignal,
    fetchHistory,
    fetchOverallPerformance,
    fetchCoinPerformance,
    fetchAnalytics,
  ]);

  useEffect(() => {
    const init = async () => {
      setLoadingDashboard(true);
      await loadDashboard();
      setLoadingDashboard(false);
    };

    init();

    const interval = setInterval(() => {
      loadDashboard();
    }, 60000);

    return () => clearInterval(interval);
  }, [loadDashboard]);

  const latestChartData = useMemo(() => {
    return (
      latestSignal?.recent_prices?.map((price, index) => ({
        step: index + 1,
        price: Number(price),
      })) || []
    );
  }, [latestSignal]);

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

  const monthlyCallCount = useMemo(() => {
    const now = new Date();
    return history.filter((item) => {
      if (!item.fetched_at) return false;
      const d = new Date(item.fetched_at);
      return (
        !Number.isNaN(d.getTime()) &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [history]);

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

  const heroStyle = {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    borderRadius: "20px",
    padding: "28px",
    color: "#ffffff",
    marginBottom: "24px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.22)",
  };

  const heroTopStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  };

  const heroTitleStyle = {
    margin: 0,
    fontSize: "34px",
    fontWeight: "700",
  };

  const heroSubtitleStyle = {
    marginTop: "10px",
    color: "#cbd5e1",
    fontSize: "15px",
    maxWidth: "720px",
    lineHeight: 1.6,
  };

  const badgeStyle = {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.3px",
  };

  const ctaRowStyle = {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "18px",
  };

  const primaryCtaStyle = {
    display: "inline-block",
    padding: "12px 18px",
    borderRadius: "10px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: "700",
    textDecoration: "none",
  };

  const secondaryCtaStyle = {
    display: "inline-block",
    padding: "12px 18px",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontWeight: "700",
    textDecoration: "none",
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
    justifyContent: "space-between",
  };

  const selectStyle = {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    minWidth: "140px",
    backgroundColor: "#ffffff",
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

  const founderGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
  };

  const darkCardStyle = {
    background: "#111827",
    borderRadius: "14px",
    padding: "16px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  };

  const founderCardStyle = {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    borderRadius: "14px",
    padding: "18px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.18)",
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

  const founderLabel = {
    fontSize: "12px",
    color: "#cbd5e1",
    marginBottom: "6px",
  };

  const founderValue = {
    fontSize: "24px",
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

  const pricingGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
  };

  const pricingCardStyle = {
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px",
    backgroundColor: "#ffffff",
  };

  const proCardStyle = {
    ...pricingCardStyle,
    border: "2px solid #2563eb",
    boxShadow: "0 8px 24px rgba(37, 99, 235, 0.12)",
  };

  return (
    <div style={appStyle}>
      <div style={containerStyle}>
        <div style={heroStyle}>
          <div style={heroTopStyle}>
            <div>
              <div
                style={{
                  ...badgeStyle,
                  backgroundColor: "#1d4ed8",
                  color: "#ffffff",
                }}
              >
                LIVE CRYPTO SIGNAL SaaS
              </div>
              <h1 style={heroTitleStyle}>AI Crypto Trading Dashboard</h1>
              <div style={heroSubtitleStyle}>
                Real-time crypto signal delivery platform with Telegram alerts,
                performance analytics, signal history, founder metrics, and premium upgrade flow.
              </div>

              <div style={ctaRowStyle}>
                <button
                  onClick={openSubscribeModal}
                  style={{
                    ...secondaryCtaStyle,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Subscribe Free
                </button>
                <a
                  href={TELEGRAM_CONTACT_URL}
                  target="_blank"
                  rel="noreferrer"
                  style={primaryCtaStyle}
                >
                  Upgrade to Pro
                </a>
              </div>
            </div>
          </div>
        </div>

        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h2 style={sectionTitleStyle}>Founder Analytics Dashboard</h2>
            <span
              style={{
                ...badgeStyle,
                backgroundColor: "#0f172a",
                color: "#ffffff",
              }}
            >
              BUSINESS OVERVIEW
            </span>
          </div>

          <div style={founderGridStyle}>
            <div style={founderCardStyle}>
              <div style={founderLabel}>Total Leads</div>
              <div style={founderValue}>{formatNumber(analytics?.leads || 0)}</div>
            </div>

            <div style={founderCardStyle}>
              <div style={founderLabel}>Telegram Subscribers</div>
              <div style={founderValue}>{formatNumber(analytics?.subscribers || 0)}</div>
            </div>

            <div style={founderCardStyle}>
              <div style={founderLabel}>Conversion Rate</div>
              <div style={founderValue}>{formatNumber(analytics?.conversion_rate || 0)}%</div>
            </div>

            <div style={founderCardStyle}>
              <div style={founderLabel}>PRO Users</div>
              <div style={founderValue}>{formatNumber(analytics?.pro_users || 0)}</div>
            </div>

            <div style={founderCardStyle}>
              <div style={founderLabel}>Revenue Potential</div>
              <div style={founderValue}>{formatCurrency(analytics?.revenue || 0)}</div>
            </div>

            <div style={founderCardStyle}>
              <div style={founderLabel}>Monthly Call Count</div>
              <div style={founderValue}>{formatNumber(monthlyCallCount)}</div>
            </div>

            <div style={founderCardStyle}>
              <div style={founderLabel}>Overall Return</div>
              <div style={founderValue}>
                {formatNumber(overallPerformance?.total_profit_pct || 0)}%
              </div>
            </div>

            <div style={founderCardStyle}>
              <div style={founderLabel}>Total Closed Trades</div>
              <div style={founderValue}>
                {formatNumber(overallPerformance?.total_trades || 0)}
              </div>
            </div>
          </div>
        </div>

        <div style={controlPanelStyle}>
          <div style={controlRowStyle}>
            <div>
              <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px" }}>
                Selected Coin
              </div>
              <select
                value={coin}
                onChange={(e) => setCoin(e.target.value)}
                style={selectStyle}
              >
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="SOL">SOL</option>
              </select>
            </div>

            <div style={{ color: "#64748b", fontSize: "14px" }}>
              Auto-refreshing dashboard every 60 seconds
            </div>
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
                  ...badgeStyle,
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
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

        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h2 style={sectionTitleStyle}>Latest Signal</h2>
            <span
              style={{
                ...badgeStyle,
                backgroundColor: "#2563eb",
                color: "#ffffff",
              }}
            >
              {coin}
            </span>
          </div>

          {loadingDashboard ? (
            <p style={emptyTextStyle}>Loading latest signal...</p>
          ) : !latestSignal ? (
            <p style={emptyTextStyle}>No saved signal found yet for {coin}.</p>
          ) : (
            <>
              <div style={signalGridStyle}>
                <div style={statCardStyle}>
                  <div style={labelStyle}>Coin Used</div>
                  <div style={valueStyle}>{latestSignal.coin_used || coin}</div>
                </div>

                <div style={statCardStyle}>
                  <div style={labelStyle}>Current Price</div>
                  <div style={valueStyle}>
                    {formatCurrency(latestSignal.current_price, 4)}
                  </div>
                </div>

                <div style={statCardStyle}>
                  <div style={labelStyle}>Signal</div>
                  <div
                    style={{
                      ...valueStyle,
                      color: getSignalColor(latestSignal.signal),
                    }}
                  >
                    {latestSignal.signal || "-"}
                  </div>
                </div>

                <div style={statCardStyle}>
                  <div style={labelStyle}>Entry</div>
                  <div style={valueStyle}>{formatCurrency(latestSignal.entry, 4)}</div>
                </div>

                <div style={statCardStyle}>
                  <div style={labelStyle}>Stop</div>
                  <div style={valueStyle}>{formatCurrency(latestSignal.stop, 4)}</div>
                </div>

                <div style={statCardStyle}>
                  <div style={labelStyle}>Target</div>
                  <div style={valueStyle}>{formatCurrency(latestSignal.target, 4)}</div>
                </div>

                <div style={statCardStyle}>
                  <div style={labelStyle}>Status</div>
                  <div
                    style={{
                      ...valueStyle,
                      color: getStatusColor(latestSignal.status),
                    }}
                  >
                    {latestSignal.status || "-"}
                  </div>
                </div>

                <div style={statCardStyle}>
                  <div style={labelStyle}>Confidence</div>
                  <div style={valueStyle}>{latestSignal.confidence || "-"}</div>
                </div>

                <div style={statCardStyle}>
                  <div style={labelStyle}>Interval</div>
                  <div style={valueStyle}>{latestSignal.interval || "-"}</div>
                </div>

                <div style={statCardStyle}>
                  <div style={labelStyle}>Signal Time</div>
                  <div style={valueStyle}>
                    {formatSignalTime(latestSignal.signal_time)}
                  </div>
                </div>
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
            </>
          )}
        </div>

        {coinPerformance && (
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <h2 style={sectionTitleStyle}>Selected Coin Performance</h2>
              <span
                style={{
                  ...badgeStyle,
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
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
                ...badgeStyle,
                backgroundColor: "#0f172a",
                color: "#ffffff",
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
                          ...badgeStyle,
                          backgroundColor: getSignalColor(item.signal),
                          color: "#ffffff",
                        }}
                      >
                        {item.signal}
                      </span>

                      <span
                        style={{
                          ...badgeStyle,
                          backgroundColor: getStatusColor(item.status),
                          color: "#ffffff",
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

        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h2 style={sectionTitleStyle}>Plans</h2>
            <span
              style={{
                ...badgeStyle,
                backgroundColor: "#1d4ed8",
                color: "#ffffff",
              }}
            >
              START FREE
            </span>
          </div>

          <div style={pricingGridStyle}>
            <div style={pricingCardStyle}>
              <div
                style={{
                  ...badgeStyle,
                  backgroundColor: "#e2e8f0",
                  color: "#0f172a",
                  marginBottom: "14px",
                }}
              >
                FREE
              </div>
              <h3 style={{ marginTop: 0, color: "#0f172a" }}>Starter Access</h3>
              <p style={{ color: "#475569", lineHeight: 1.7 }}>
                Get access to BTC, ETH, and SOL alerts with basic strategy
                signals and limited coverage.
              </p>
              <div style={{ color: "#334155", lineHeight: 1.9 }}>
                ✔ BTC / ETH / SOL alerts<br />
                ✔ Basic strategy signals<br />
                ✔ Limited alert coverage
              </div>
              <button
                onClick={openSubscribeModal}
                style={{
                  ...primaryCtaStyle,
                  marginTop: "16px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Join Free
              </button>
            </div>

            <div style={proCardStyle}>
              <div
                style={{
                  ...badgeStyle,
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  marginBottom: "14px",
                }}
              >
                PRO
              </div>
              <h3 style={{ marginTop: 0, color: "#0f172a" }}>Premium Access</h3>
              <p style={{ color: "#475569", lineHeight: 1.7 }}>
                Unlock real-time alerts, more markets, AI-enhanced trade calls,
                market updates, and premium signal delivery.
              </p>
              <div style={{ color: "#334155", lineHeight: 1.9 }}>
                ✔ Real-time premium alerts<br />
                ✔ More coins & timeframes<br />
                ✔ AI-enhanced trade signals<br />
                ✔ Market & macro updates
              </div>
              <a
                href={TELEGRAM_CONTACT_URL}
                target="_blank"
                rel="noreferrer"
                style={{ ...primaryCtaStyle, marginTop: "16px" }}
              >
                Upgrade to Pro
              </a>
            </div>
          </div>
        </div>
      </div>

      {showSubscribeModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 20px 60px rgba(15, 23, 42, 0.28)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, color: "#0f172a", fontSize: "22px" }}>Join Free Plan</h2>
              <button
                onClick={() => setShowSubscribeModal(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ×
              </button>
            </div>

            <p style={{ color: "#475569", marginTop: 0, lineHeight: 1.6 }}>
              Enter your details to join the free plan, then continue to our Telegram bot.
            </p>

            <form onSubmit={handleSubscribeFree}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "6px", color: "#334155", fontWeight: "600" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Enter your full name"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "6px", color: "#334155", fontWeight: "600" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {leadMessage && (
                <p style={{ color: leadMessage.includes("Redirecting") ? "#16a34a" : "#dc2626", marginBottom: "12px" }}>
                  {leadMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={submittingLead}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "15px",
                }}
              >
                {submittingLead ? "Saving..." : "Submit & Join Telegram"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;