import React from "react";

const Footer = () => {
  return (
    <footer className="bg-transparent py-12 border-t border-zinc-900 mt-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} DailyBugle. All rights reserved.
          </p>
          <p className="text-sm text-zinc-500">
            URL service by{" "}
            <a
              href="https://coffeenblog.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-green-500 transition-colors font-medium"
            >
              Coffeenblog.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
