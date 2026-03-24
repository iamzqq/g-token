"use client";

import { useEffect, useState } from "react";
import Head from "next/head";

export default function Home() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [now, setNow] = useState(Date.now()); // 触发剩余时间刷新

  // 定时刷新当前时间
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 计算剩余分钟数
  const getRemainingMinutes = (expiresAt) => {
    const expireTime = new Date(expiresAt).getTime();
    const diffMs = expireTime - now;
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / 60000);
  };

  // 其他函数保持不变...
  const fetchTokens = async () => {
    /* 不变 */
  };
  const generateToken = async () => {
    /* 不变 */
  };
  const deleteToken = async (id) => {
    /* 不变 */
  };
  const copyToClipboard = (token) => {
    /* 不变 */
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Head>
        <title>一次性令牌管理器</title>
      </Head>
      <div className="max-w-5xl mx-auto">
        {" "}
        {/* 加宽一点 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">一次性令牌管理器</h1>
          <button
            onClick={generateToken}
            disabled={isGenerating}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow ${
              isGenerating ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isGenerating ? "生成中..." : "+ 生成新令牌"}
          </button>
        </div>
        {copySuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
            {copySuccess}
          </div>
        )}
        {loading ? (
          <div className="text-center py-10">加载中...</div>
        ) : tokens.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            暂无可用令牌，点击“生成新令牌”创建。
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    令牌
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    过期时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    剩余时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tokens.map((token) => {
                  const remainingMins = getRemainingMinutes(token.expires_at);
                  return (
                    <tr key={token.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">
                        {token.token}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(token.expires_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {remainingMins <= 0 ? (
                          <span className="text-red-600 font-medium">
                            已过期
                          </span>
                        ) : (
                          `${remainingMins} 分钟`
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          可用
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => copyToClipboard(token.token)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          复制
                        </button>
                        <button
                          onClick={() => deleteToken(token.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
