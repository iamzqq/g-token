"use client";

import { useEffect, useState } from "react";
import Head from "next/head";

// 定义令牌对象的结构
interface Token {
  id: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export default function Home() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<string>("");
  const [now, setNow] = useState<number>(Date.now());

  // 定时刷新当前时间
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 计算剩余分钟数
  const getRemainingMinutes = (expiresAt: string): number => {
    const expireTime = new Date(expiresAt).getTime();
    const diffMs = expireTime - now;
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / 60000);
  };

  // 获取令牌列表
  const fetchTokens = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch("/api/tokens");
      const data = await res.json();
      setTokens(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 生成新令牌
  const generateToken = async (): Promise<void> => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/tokens", { method: "POST" });
      const newToken: Token = await res.json();
      setTokens((prev) => [newToken, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 删除令牌
  const deleteToken = async (id: string): Promise<void> => {
    if (!confirm("确定要删除此令牌吗？")) return;
    try {
      await fetch(`/api/tokens?id=${id}`, { method: "DELETE" });
      setTokens((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // 复制令牌到剪贴板
  const copyToClipboard = (token: string): void => {
    navigator.clipboard.writeText(token);
    setCopySuccess(`已复制：${token}`);
    setTimeout(() => setCopySuccess(""), 2000);
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
