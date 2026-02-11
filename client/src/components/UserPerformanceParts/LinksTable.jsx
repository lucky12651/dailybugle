import React from "react";
import Loader from "../Loader";
import {
  Info,
  BarChart3,
  ChevronDown,
  Link as LinkIcon,
  Eye,
  Clock,
} from "lucide-react";

const LinksTable = ({
  userLinks,
  loadingLinks,
  selectedLink,
  setSelectedLink,
  dailyLink,
  setDailyLink,
  hasMoreLinks,
  handleLoadMoreLinks,
  loadingMoreLinks,
}) => {
  if (loadingLinks && userLinks.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl overflow-hidden p-12 flex justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
      <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-900/30 flex items-center justify-between">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <LinkIcon size={16} className="text-green-500" />
          Accessed Links
        </h4>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          {userLinks.length} Active Slugs
        </span>
      </div>

      {userLinks.length > 0 ? (
        <>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-zinc-900">
              <thead className="bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <LinkIcon size={12} />
                      Link Slug
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Eye size={12} />
                      Views
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Clock size={12} />
                      Last Accessed
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 bg-zinc-950">
                {userLinks.map((link) => (
                  <tr
                    key={link.slug}
                    className={`group hover:bg-zinc-900/40 transition-colors ${
                      selectedLink?.slug === link.slug ||
                      dailyLink?.slug === link.slug
                        ? "bg-zinc-900/60"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-500 group-hover:text-green-400 transition-colors">
                        /{link.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-black text-white">
                        {link.views}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-zinc-400 font-medium">
                        {link.lastAccessed
                          ? new Date(link.lastAccessed).toLocaleString(
                              "en-IN",
                              {
                                timeZone: "Asia/Kolkata",
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedLink(link)}
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            selectedLink?.slug === link.slug
                              ? "bg-blue-600 text-black border-blue-600"
                              : "bg-zinc-900 text-blue-500 border-zinc-800 hover:border-blue-500/50 hover:bg-blue-500/5"
                          }`}
                        >
                          <Info size={14} className="mr-1.5" />
                          Info
                        </button>
                        <button
                          onClick={() => setDailyLink(link)}
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            dailyLink?.slug === link.slug
                              ? "bg-emerald-600 text-black border-emerald-600"
                              : "bg-zinc-900 text-emerald-500 border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                          }`}
                        >
                          <BarChart3 size={14} className="mr-1.5" />
                          Daily
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMoreLinks && (
            <div className="px-6 py-4 border-t border-zinc-900 bg-zinc-900/20 text-center">
              <button
                onClick={handleLoadMoreLinks}
                disabled={loadingMoreLinks}
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-widest disabled:opacity-50 transition-colors py-2 px-4 rounded-xl hover:bg-zinc-800"
              >
                {loadingMoreLinks ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  <>
                    Show More
                    <ChevronDown size={14} />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="p-16 text-center">
          <div className="inline-flex p-4 bg-zinc-900 rounded-full mb-4">
            <LinkIcon size={32} className="text-zinc-700" />
          </div>
          <p className="text-zinc-500 text-sm font-medium">
            No active slugs found for this user
          </p>
        </div>
      )}
    </div>
  );
};

export default LinksTable;
