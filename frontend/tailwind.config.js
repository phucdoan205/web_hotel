/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Bạn có thể thêm màu xanh của Traveloka vào đây để dùng cho chuẩn
        primary: "#0194f3",
      },
    },
  },
  plugins: [],
};
