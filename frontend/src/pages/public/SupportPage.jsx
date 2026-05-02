import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Search, ChevronRight, ChevronDown, Phone, Mail, MapPin, Calendar, CreditCard, RefreshCw, HelpCircle, FileText, Info, ShieldCheck, User, BookOpen, Ticket } from "lucide-react";

const FAQAccordion = ({ question, answer }) => (
  <details className="group border-b border-slate-100 last:border-0 [&_summary::-webkit-details-marker]:hidden bg-white rounded-2xl">
    <summary className="flex items-center justify-between py-4 px-6 cursor-pointer text-slate-700 font-medium hover:text-blue-600 transition-colors">
      <span>{question}</span>
      <ChevronRight className="size-4 text-slate-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-4" />
    </summary>
    <div className="pb-5 px-6 text-slate-600 text-sm leading-relaxed">
      {answer}
    </div>
  </details>
);

const SupportPage = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({
    "guide": true,
    "account": true,
    "booking": true,
    "payment": true,
    "modify": true,
    "general": true,
    "other": true
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const allSearchableFaqs = [
    { q: "Làm thế nào để tìm kiếm và đặt phòng?", id: "how-to-book" },
    { q: "Xem hình ảnh và tiện ích phòng ở đâu?", id: "how-to-book" },
    { q: "Giá phòng đã bao gồm thuế phí chưa?", id: "how-to-book" },
    { q: "Sử dụng mã giảm giá (Voucher) như thế nào?", id: "promotions-vouchers" },
    { q: "Đăng ký tài khoản thành viên?", id: "account-management" },
    { q: "Quên mật khẩu đăng nhập?", id: "account-management" },
    { q: "Cần đăng ký tài khoản trước khi đặt không?", id: "before-booking" },
    { q: "Đặt phòng thay cho gia đình/bạn bè?", id: "before-booking" },
    { q: "Biết đặt phòng được xác nhận hay chưa?", id: "after-booking" },
    { q: "Thời gian nhận và trả phòng là khi nào?", id: "after-booking" },
    { q: "Hình thức thanh toán hỗ trợ?", id: "payment-info" },
    { q: "Xuất hóa đơn VAT?", id: "invoice-receipt" },
    { q: "Làm thế nào để hủy phòng đã đặt?", id: "refund-policy" },
    { q: "Đổi sang loại phòng khác?", id: "modify-booking" },
    { q: "Thay đổi ngày nhận/trả phòng?", id: "modify-booking" },
    { q: "Khách sạn có cho phép mang thú cưng không?", id: "general-rules" },
    { q: "Chính sách bảo mật thông tin?", id: "privacy-policy" },
    { q: "Điều khoản sử dụng dịch vụ?", id: "terms" },
  ];

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    const filtered = allSearchableFaqs.filter(item => 
      item.q.toLowerCase().includes(val.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const toggleMenu = (id) => {
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isDashboard = !pageId || pageId === "help-center";
  const currentCategory = isDashboard ? "before-booking" : pageId;

  const sidebarMenu = [
    {
      id: "guide",
      title: "Cách sử dụng hệ thống",
      items: [
        { id: "how-to-book", label: "Hướng dẫn đặt phòng" },
        { id: "promotions-vouchers", label: "Mã ưu đãi & Giảm giá" },
      ]
    },
    {
      id: "account",
      title: "Tài khoản của bạn",
      items: [
        { id: "account-management", label: "Quản lý tài khoản" },
      ]
    },
    {
      id: "booking",
      title: "Đơn đặt phòng của bạn",
      items: [
        { id: "before-booking", label: "Trước khi đặt" },
        { id: "after-booking", label: "Sau khi đặt" },
      ]
    },
    {
      id: "payment",
      title: "Thanh toán & Hóa đơn",
      items: [
        { id: "payment-info", label: "Thanh toán" },
        { id: "invoice-receipt", label: "Hóa đơn & Biên lai" }
      ]
    },
    {
      id: "modify",
      title: "Sửa đổi đơn & hoàn tiền",
      items: [
        { id: "modify-booking", label: "Sửa đổi đơn phòng" },
        { id: "refund-policy", label: "Hủy phòng & Hoàn tiền" }
      ]
    },
    {
      id: "general",
      title: "Thông tin khách sạn",
      items: [
        { id: "general-rules", label: "Quy định & Tiện ích" }
      ]
    },
    {
      id: "other",
      title: "Hỗ trợ khác",
      items: [
        { id: "contact-us", label: "Liên hệ CSKH" },
        { id: "privacy-policy", label: "Chính sách bảo mật" },
        { id: "terms", label: "Điều khoản sử dụng" }
      ]
    }
  ];

  const contentMap = {
    "how-to-book": {
      title: "Hướng dẫn đặt phòng",
      breadcrumb: "Cách sử dụng hệ thống",
      content: (
        <div className="bg-white rounded-2xl border border-slate-200">
          <FAQAccordion 
            question="Làm thế nào để tìm kiếm và đặt phòng trên website?" 
            answer={<>Bạn nhập điểm đến (hoặc chọn khách sạn), ngày nhận/trả phòng và số lượng khách vào thanh tìm kiếm trên Trang chủ. Hệ thống sẽ hiển thị các loại phòng còn trống. Bạn chọn phòng ưng ý, nhấn <strong>"Đặt phòng"</strong>, điền thông tin và tiến hành thanh toán.</>} 
          />
          <FAQAccordion 
            question="Tôi có thể xem hình ảnh và tiện ích của phòng ở đâu?" 
            answer="Khi bạn nhấn vào tên loại phòng hoặc nút 'Xem chi tiết' trong kết quả tìm kiếm, một trang thông tin sẽ hiện ra với đầy đủ hình ảnh, danh sách tiện ích (Wifi, Tivi, Điều hòa...), kích thước giường và diện tích phòng." 
          />
          <FAQAccordion 
            question="Làm sao để biết giá phòng đã bao gồm thuế phí chưa?" 
            answer="Tất cả giá hiển thị trên hệ thống của chúng tôi đều là giá cuối cùng, đã bao gồm thuế VAT và phí phục vụ. Bạn sẽ không phải trả thêm bất kỳ khoản phí ẩn nào khác khi thanh toán." 
          />
        </div>
      )
    },
    "promotions-vouchers": {
      title: "Mã ưu đãi & Giảm giá",
      breadcrumb: "Cách sử dụng hệ thống",
      content: (
        <div className="bg-white rounded-2xl border border-slate-200">
          <FAQAccordion 
            question="Làm thế nào để sử dụng mã giảm giá (Voucher)?" 
            answer="Tại trang Thanh toán, bạn sẽ thấy phần 'Mã ưu đãi'. Nhập mã giảm giá hợp lệ của bạn và nhấn 'Áp dụng', hệ thống sẽ tự động trừ đi số tiền được giảm trước khi bạn thanh toán." 
          />
          <FAQAccordion 
            question="Mã giảm giá của tôi báo không hợp lệ?" 
            answer="Mã giảm giá có thể không hợp lệ do: Đã hết hạn sử dụng, chưa đạt giá trị đơn hàng tối thiểu, đã hết lượt dùng, hoặc không áp dụng cho loại phòng bạn chọn. Vui lòng kiểm tra lại điều kiện áp dụng của Voucher." 
          />
          <FAQAccordion 
            question="Tôi có thể áp dụng nhiều mã giảm giá cùng lúc không?" 
            answer="Rất tiếc, mỗi đơn đặt phòng chỉ có thể áp dụng một mã ưu đãi (Voucher) duy nhất. Bạn hãy chọn mã mang lại mức giảm giá tốt nhất cho đơn hàng của mình." 
          />
        </div>
      )
    },
    "account-management": {
      title: "Quản lý tài khoản",
      breadcrumb: "Tài khoản của bạn",
      content: (
        <div className="bg-white rounded-2xl border border-slate-200">
          <FAQAccordion 
            question="Làm thế nào để đăng ký tài khoản thành viên?" 
            answer="Nhấn vào nút 'Đăng ký' ở góc phải màn hình, điền Email, Mật khẩu và Họ tên. Việc có tài khoản giúp bạn lưu lịch sử đặt phòng, quản lý thông tin dễ dàng và nhận các ưu đãi đặc quyền." 
          />
          <FAQAccordion 
            question="Tôi quên mật khẩu đăng nhập, phải làm sao?" 
            answer="Tại màn hình Đăng nhập, bạn có thể sử dụng chức năng 'Quên mật khẩu' (nếu có) để hệ thống gửi liên kết đặt lại mật khẩu. Hoặc liên hệ bộ phận hỗ trợ kỹ thuật để được cấp lại mật khẩu." 
          />
          <FAQAccordion 
            question="Làm thế nào để thay đổi thông tin cá nhân?" 
            answer="Sau khi đăng nhập, truy cập mục 'Hồ sơ cá nhân' (Profile) bằng cách nhấn vào Avatar ở góc phải trên cùng. Tại đây bạn có thể cập nhật Họ tên, Số điện thoại và Email liên hệ." 
          />
        </div>
      )
    },
    "before-booking": {
      title: "Trước khi đặt",
      breadcrumb: "Đơn đặt phòng của bạn",
      content: (
        <div className="bg-white rounded-2xl border border-slate-200">
          <FAQAccordion 
            question="Tôi có cần đăng ký tài khoản trước khi đặt phòng không?" 
            answer={<>Việc tạo tài khoản là <strong>không bắt buộc</strong> nhưng được khuyến khích. Bạn có thể đặt phòng với tư cách khách bằng cách cung cấp Số điện thoại và Họ tên, hệ thống sẽ tự động ghi nhận thông tin. Tuy nhiên, nếu có tài khoản, bạn có thể dễ dàng quản lý đơn phòng và xem lịch sử đặt phòng của mình.</>} 
          />
          <FAQAccordion 
            question="Tôi có thể đặt phòng thay cho gia đình và bạn bè được không?" 
            answer="Có. Khi điền thông tin đặt phòng, bạn chỉ cần nhập thông tin liên hệ (Họ Tên, Số điện thoại) của người sẽ trực tiếp nhận phòng tại khách sạn. Bạn có thể dùng email của mình để nhận xác nhận." 
          />
          <FAQAccordion 
            question="Tôi có thể yêu cầu cũi/nôi cho em bé không?" 
            answer="Có, khách sạn có cung cấp cũi/nôi trẻ em miễn phí (tùy thuộc vào tình trạng sẵn có). Vui lòng ghi chú yêu cầu này trong mục 'Ghi chú đặc biệt' khi thực hiện đặt phòng để chúng tôi chuẩn bị trước." 
          />
          <FAQAccordion 
            question="Tôi muốn đặt phòng số lượng lớn cho đoàn khách thì làm thế nào?" 
            answer="Đối với các đơn đặt phòng từ 5 phòng trở lên hoặc cho đoàn khách lớn, vui lòng liên hệ trực tiếp với bộ phận Kinh doanh qua mục Liên hệ CSKH để nhận được báo giá ưu đãi và hỗ trợ sắp xếp phòng tốt nhất." 
          />
        </div>
      )
    },
    "after-booking": {
      title: "Sau khi đặt",
      breadcrumb: "Đơn đặt phòng của bạn",
      content: (
        <div className="bg-white rounded-2xl border border-slate-200">
          <FAQAccordion 
            question="Làm thế nào để biết đặt phòng của tôi được xác nhận?" 
            answer="Sau khi bạn hoàn tất đặt phòng, hệ thống sẽ tự động tạo một mã đặt phòng (Ví dụ: BK-2026...). Bạn có thể vào phần 'Lịch sử đặt phòng' trên tài khoản của mình để kiểm tra trạng thái đơn. Khi đơn chuyển sang trạng thái 'Đã xác nhận' (Confirmed), phòng của bạn đã được đảm bảo." 
          />
          <FAQAccordion 
            question="Thời gian nhận và trả phòng là khi nào?" 
            answer={<>Thời gian nhận phòng (Check-in) tiêu chuẩn là từ <strong>14:00 chiều</strong> và thời gian trả phòng (Check-out) là trước <strong>12:00 trưa</strong>.</>} 
          />
          <FAQAccordion 
            question="Tôi chưa thanh toán thì có được nhận phòng không?" 
            answer={<><strong>Không.</strong> Theo quy định của hệ thống, đơn đặt phòng của bạn bắt buộc phải được thanh toán thành công (trạng thái Confirmed) thì lễ tân mới có thể tiến hành thủ tục nhận phòng (Check-in) trên hệ thống.</>} 
          />
          <FAQAccordion 
            question="Tôi đã đặt phòng nhưng chưa nhận được email xác nhận, tôi nên làm gì?" 
            answer="Đôi khi email xác nhận có thể rơi vào hộp thư Rác (Spam) hoặc Quảng cáo. Vui lòng kiểm tra kỹ các hộp thư này. Nếu vẫn không thấy, bạn có thể đăng nhập vào tài khoản để xem mã đơn đặt phòng, hoặc gọi trực tiếp Hotline để lễ tân gửi lại xác nhận." 
          />
        </div>
      )
    },
    "payment-info": {
      title: "Thanh toán",
      breadcrumb: "Thanh toán & Hóa đơn",
      content: (
        <div className="bg-white rounded-2xl border border-slate-200">
          <FAQAccordion 
            question="Khách sạn hỗ trợ hình thức thanh toán nào?" 
            answer="Hệ thống của chúng tôi hiện tại hỗ trợ thanh toán trực tuyến qua mã QR (VietQR) và ví điện tử MoMo. Nếu bạn đặt phòng trực tiếp tại quầy, bạn có thể thanh toán bằng tiền mặt hoặc thẻ tín dụng/ghi nợ qua máy POS." 
          />
          <FAQAccordion 
            question="Tại sao trạng thái phòng của tôi là 'Paying'?" 
            answer="Trạng thái 'Paying' nghĩa là hệ thống đã ghi nhận yêu cầu thanh toán của bạn nhưng giao dịch vẫn đang chờ xác nhận từ ngân hàng hoặc ví điện tử. Trạng thái sẽ tự động chuyển sang 'Confirmed' ngay sau khi hệ thống nhận được thông báo thanh toán thành công." 
          />
          <FAQAccordion 
            question="Tôi có thể thanh toán một phần (đặt cọc) trước được không?" 
            answer="Hiện tại hệ thống đặt phòng trực tuyến yêu cầu thanh toán 100% giá trị đơn phòng để đảm bảo giữ phòng. Việc đặt cọc một phần chỉ áp dụng cho khách đoàn đặt qua bộ phận Kinh doanh." 
          />
          <FAQAccordion 
            question="Thanh toán qua ví MoMo/VietQR có mất phí giao dịch không?" 
            answer="Không, bạn hoàn toàn không phải chịu bất kỳ khoản phí giao dịch nào khi thanh toán trực tuyến qua MoMo hoặc VietQR trên hệ thống của chúng tôi." 
          />
        </div>
      )
    },
    "invoice-receipt": {
      title: "Hóa đơn & Biên lai",
      breadcrumb: "Thanh toán & Hóa đơn",
      content: (
        <div className="bg-white rounded-2xl border border-slate-200">
          <FAQAccordion 
            question="Làm thế nào để xuất hóa đơn VAT?" 
            answer="Khách sạn hỗ trợ xuất hóa đơn điện tử VAT. Bạn có thể yêu cầu xuất hóa đơn tại quầy lễ tân khi làm thủ tục trả phòng (Check-out). Vui lòng cung cấp chính xác Tên công ty, Mã số thuế và Địa chỉ." 
          />
          <FAQAccordion 
            question="Tôi có thể nhận hóa đơn điện tử qua email không?" 
            answer="Có. Khi bạn cung cấp địa chỉ email cho lễ tân lúc yêu cầu xuất hóa đơn, hệ thống hóa đơn điện tử sẽ tự động gửi bản PDF của hóa đơn VAT về email của bạn trong vòng 24 giờ kể từ lúc Check-out." 
          />
          <FAQAccordion 
            question="Thông tin trên hóa đơn có thể thay đổi sau khi xuất không?" 
            answer="Theo quy định của cơ quan thuế, hóa đơn đã xuất sẽ không thể thay đổi thông tin tùy ý. Nếu có sai sót từ phía khách hàng khi cung cấp thông tin, quy trình lập hóa đơn điều chỉnh sẽ mất khá nhiều thời gian. Vui lòng kiểm tra kỹ thông tin trước khi yêu cầu xuất." 
          />
        </div>
      )
    },
    "modify-booking": {
      title: "Sửa đổi đơn phòng",
      breadcrumb: "Sửa đổi đơn & hoàn tiền",
      content: (
        <div className="bg-white rounded-2xl border border-slate-200">
          <FAQAccordion 
            question="Tôi có thể đổi sang loại phòng khác sau khi đặt không?" 
            answer={<><strong>Có</strong>. Hệ thống hỗ trợ tính năng "Chuyển đổi phòng" thông qua bộ phận lễ tân. Khi bạn có nhu cầu đổi phòng, hệ thống sẽ tự động tính toán số tiền chênh lệch dựa trên số đêm lưu trú và giá của loại phòng mới. Bạn sẽ thanh toán thêm phần chênh lệch nếu phòng mới có giá cao hơn.</>} 
          />
          <FAQAccordion 
            question="Tôi có thể thay đổi ngày nhận phòng/trả phòng không?" 
            answer="Bạn có thể yêu cầu thay đổi ngày lưu trú thông qua bộ phận CSKH ít nhất 48 giờ trước ngày nhận phòng (tùy thuộc vào tình trạng phòng trống). Hệ thống có thể yêu cầu thanh toán phụ thu nếu giá phòng ngày mới cao hơn." 
          />
          <FAQAccordion 
            question="Tôi có thể thêm người vào phòng đã đặt không?" 
            answer="Có, tuy nhiên mỗi loại phòng có quy định về số lượng khách tối đa. Nếu số người vượt quá sức chứa tiêu chuẩn nhưng vẫn trong giới hạn cho phép, bạn sẽ phải đóng thêm phí phụ thu người thứ 3." 
          />
          <FAQAccordion 
            question="Phí phụ thu khi thêm người được tính như thế nào?" 
            answer="Phí phụ thu người lớn (có thêm giường phụ hoặc không) và trẻ em sẽ được tính theo bảng giá quy định của khách sạn. Bạn có thể thanh toán khoản phụ thu này trực tiếp tại quầy lễ tân khi Check-in." 
          />
        </div>
      )
    },
    "refund-policy": {
      title: "Hủy phòng & Hoàn tiền",
      breadcrumb: "Sửa đổi đơn & hoàn tiền",
      content: (
        <div className="bg-white rounded-2xl border border-slate-200">
          <FAQAccordion 
            question="Làm thế nào để tôi có thể hủy phòng đã đặt?" 
            answer={<>Bạn <strong>chỉ có thể tự hủy phòng khi đặt phòng đang ở trạng thái Chờ xử lý (Pending)</strong> - tức là chưa thực hiện thanh toán. Nếu phòng của bạn đã chuyển sang trạng thái <strong>Đã xác nhận (Confirmed)</strong> hoặc đã thanh toán, bạn sẽ không thể tự hủy trên hệ thống. Vui lòng liên hệ CSKH để được hỗ trợ kiểm tra điều kiện hoàn hủy.</>} 
          />
          <FAQAccordion 
            question="Quy định hoàn tiền khi hủy phòng trước 48 giờ là gì?" 
            answer="Nếu bạn hủy phòng hợp lệ trước thời điểm Check-in 48 giờ, hệ thống sẽ hỗ trợ hoàn tiền 100% qua phương thức thanh toán ban đầu (có thể trừ đi phí giao dịch của cổng thanh toán nếu có quy định)." 
          />
          <FAQAccordion 
            question="Khi nào tôi mới nhận được tiền hoàn lại vào thẻ/tài khoản?" 
            answer="Thời gian xử lý hoàn tiền thường mất từ 5-15 ngày làm việc tùy thuộc vào ngân hàng thụ hưởng hoặc quy trình của cổng thanh toán MoMo/VNPay. Nếu sau 15 ngày vẫn chưa nhận được, vui lòng liên hệ CSKH." 
          />
          <FAQAccordion 
            question="Nếu tôi không đến nhận phòng (No-show), tôi có được hoàn tiền không?" 
            answer="Trong trường hợp khách hàng không đến nhận phòng (No-show) vào ngày Check-in mà không có thông báo hủy phòng hợp lệ trước đó, toàn bộ số tiền đã thanh toán sẽ không được hoàn lại theo chính sách." 
          />
        </div>
      )
    },
    "general-rules": {
      title: "Quy định & Tiện ích",
      breadcrumb: "Thông tin khách sạn",
      content: (
        <div className="bg-white rounded-2xl border border-slate-200">
          <FAQAccordion 
            question="Khách sạn có cho phép mang thú cưng không?" 
            answer="Rất tiếc, để đảm bảo không gian chung sạch sẽ và không gây dị ứng cho các khách hàng khác, khách sạn chúng tôi có quy định KHÔNG cho phép mang thú cưng vào khu vực lưu trú." 
          />
          <FAQAccordion 
            question="Khách sạn có dịch vụ đưa đón sân bay không?" 
            answer="Chúng tôi có cung cấp dịch vụ xe đưa đón sân bay (có tính phí). Vui lòng đặt trước ít nhất 24 giờ thông qua lễ tân hoặc hotline để chúng tôi sắp xếp xe." 
          />
          <FAQAccordion 
            question="Khách sạn có cung cấp bữa sáng miễn phí không?" 
            answer="Tùy thuộc vào loại phòng và gói dịch vụ bạn đặt. Nếu giá phòng đã bao gồm ăn sáng, bạn sẽ được thưởng thức buffet sáng tại nhà hàng của chúng tôi từ 6:30 - 9:30 hàng ngày." 
          />
          <FAQAccordion 
            question="Tôi có thể gửi hành lý tại khách sạn trước khi nhận phòng hoặc sau khi trả phòng không?" 
            answer="Có, dịch vụ giữ hành lý tại quầy lễ tân là hoàn toàn miễn phí trong ngày cho khách lưu trú. Bạn có thể gửi hành lý để đi tham quan thoải mái trước giờ Check-in hoặc sau giờ Check-out." 
          />
        </div>
      )
    },
    "contact-us": {
      title: "Liên hệ với chúng tôi",
      breadcrumb: "Hỗ trợ khác",
      content: (
        <div className="grid md:grid-cols-3 gap-6 mt-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Phone className="size-6" />
            </div>
            <h4 className="font-bold text-slate-800 mb-2">Tổng đài 24/7</h4>
            <p className="text-sm text-slate-600 font-medium">1900 1234 5678</p>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mb-4">
              <Mail className="size-6" />
            </div>
            <h4 className="font-bold text-slate-800 mb-2">Email Hỗ trợ</h4>
            <p className="text-sm text-slate-600 font-medium">vuthai.bh2026@gmail.com</p>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <MapPin className="size-6" />
            </div>
            <h4 className="font-bold text-slate-800 mb-2">Trụ sở chính</h4>
            <p className="text-sm text-slate-600">Tòa nhà HPT, Quận 1, TP.HCM</p>
          </div>
        </div>
      )
    },
    "privacy-policy": {
      title: "Chính sách bảo mật",
      breadcrumb: "Hỗ trợ khác",
      content: (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-sm">
            <p className="mb-4">Tại nền tảng đặt phòng của chúng tôi, quyền riêng tư của khách hàng là ưu tiên hàng đầu. Chúng tôi cam kết bảo vệ thông tin cá nhân và minh bạch trong việc sử dụng dữ liệu.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">1. Thu thập thông tin cá nhân</h3>
            <p>Chúng tôi thu thập các thông tin như Họ tên, số điện thoại, email khi bạn đăng ký tài khoản hoặc thực hiện đặt phòng trực tuyến.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">2. Mục đích sử dụng dữ liệu</h3>
            <p>Thông tin được dùng để xử lý đơn đặt phòng, gửi mã xác nhận BK, hỗ trợ giải quyết thắc mắc và cải thiện chất lượng dịch vụ.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">3. Bảo mật giao dịch thanh toán</h3>
            <p>Mọi giao dịch thanh toán được xử lý qua cổng MoMo hoặc VietQR được mã hóa SSL, đảm bảo thông tin thẻ/tài khoản không bị rò rỉ.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">4. Chia sẻ thông tin với bên thứ ba</h3>
            <p>Chúng tôi chỉ cung cấp thông tin cần thiết cho bộ phận Lễ tân và Quản lý phòng để phục vụ quy trình Check-in/Check-out của bạn.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">5. Thời gian lưu trữ thông tin</h3>
            <p>Thông tin cá nhân được lưu trữ trong suốt quá trình bạn sử dụng dịch vụ hoặc cho đến khi có yêu cầu xóa tài khoản từ phía khách hàng.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">6. Quyền của chủ thể dữ liệu</h3>
            <p>Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu tạm khóa thông tin cá nhân của mình bất kỳ lúc nào thông qua trang Quản lý hồ sơ.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">7. Công nghệ Cookie</h3>
            <p>Website sử dụng Cookie để ghi nhớ phiên đăng nhập và ghi nhận hành vi tìm kiếm nhằm đề xuất các loại phòng phù hợp nhất với bạn.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">8. Trách nhiệm bảo mật tài khoản</h3>
            <p>Khách hàng có trách nhiệm tự bảo mật mật khẩu đăng nhập. Chúng tôi không chịu trách nhiệm nếu thông tin bị lộ do lỗi từ phía người dùng.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">9. Bảo vệ trẻ em</h3>
            <p>Dịch vụ của chúng tôi không hướng tới trẻ em dưới 13 tuổi. Chúng tôi không chủ động thu thập dữ liệu cá nhân của đối tượng này.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">10. Thay đổi và cập nhật</h3>
            <p>Chúng tôi có quyền cập nhật chính sách này bất kỳ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website chính thức.</p>
          </div>
        </div>
      )
    },
    "terms": {
      title: "Điều khoản sử dụng",
      breadcrumb: "Hỗ trợ khác",
      content: (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-sm">
            <p className="mb-4">Chào mừng bạn đến với hệ thống đặt phòng. Khi sử dụng dịch vụ, bạn vui lòng tuân thủ các điều khoản sử dụng sau đây:</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">1. Thỏa thuận sử dụng dịch vụ</h3>
            <p>Bằng cách truy cập website, bạn cam kết đã đọc và đồng ý với mọi điều khoản mà hệ thống đặt ra để đảm bảo quyền lợi chung.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">2. Quy định về độ tuổi</h3>
            <p>Người dùng phải từ 18 tuổi trở lên hoặc có sự giám sát của người giám hộ hợp pháp để thực hiện các giao dịch thanh toán phòng.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">3. Trách nhiệm về thông tin cung cấp</h3>
            <p>Mọi thông tin cá nhân (Họ tên, SĐT) phải chính xác 100%. Thông tin này sẽ được dùng để đối chiếu khi bạn làm thủ tục nhận phòng.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">4. Chính sách giá và thuế</h3>
            <p>Giá hiển thị là giá đã bao gồm VAT và phí phục vụ. Tuy nhiên, một số dịch vụ phát sinh tại chỗ có thể sẽ được tính phí riêng.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">5. Quy trình xác nhận đặt phòng</h3>
            <p>Đơn đặt phòng chỉ được coi là thành công khi bạn nhận được mã BK (Booking Code) và trạng thái hiển thị là "Confirmed".</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">6. Quy định về hoàn hủy (Refund)</h3>
            <p>Việc hoàn tiền phụ thuộc vào chính sách cụ thể của từng loại phòng. Vui lòng đọc kỹ thông tin hoàn trả trước khi thanh toán.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">7. Quyền sở hữu nội dung</h3>
            <p>Toàn bộ hình ảnh, văn bản và logo trên hệ thống đều thuộc quyền sở hữu của khách sạn. Mọi hành vi sao chép trái phép đều bị nghiêm cấm.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">8. Giới hạn trách nhiệm</h3>
            <p>Hệ thống không chịu trách nhiệm cho các tổn thất do sự cố mạng từ phía khách hàng hoặc do khách hàng cung cấp sai thông tin liên hệ.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">9. Trường hợp bất khả kháng</h3>
            <p>Trong các tình huống thiên tai, dịch bệnh hoặc chiến tranh, chính sách lưu trú sẽ được điều chỉnh theo quy định chung của Nhà nước.</p>
            
            <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">10. Luật pháp và Giải quyết tranh chấp</h3>
            <p>Mọi tranh chấp phát sinh sẽ được giải quyết dựa trên quy định hiện hành của pháp luật Việt Nam và tinh thần thỏa thuận giữa hai bên.</p>
          </div>
        </div>
      )
    }
  };

  const pageData = contentMap[currentCategory] || contentMap["before-booking"];

  if (isDashboard) {
    return (
      <div className="bg-[#f7f9fa] min-h-screen pb-20 font-sans">
        {/* Hero Section with Image Banner */}
        <div className="relative pt-32 pb-24 px-6 z-40">
          {/* Background Image */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img 
              src="/assets/help_center_banner.png" 
              alt="Help Center Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#0F3557]/70 mix-blend-multiply"></div>
          </div>
          
          <div className="relative z-10 max-w-[800px] mx-auto text-center">
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-8 tracking-tight">
              Xin chào, chúng tôi có thể giúp gì cho bạn?
            </h1>
            <div className="relative max-w-2xl mx-auto shadow-2xl rounded-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Nhập câu hỏi (VD: Hoàn tiền, Đổi ngày...)"
                className="w-full bg-white border-none rounded-full py-4 pl-14 pr-6 text-slate-700 outline-none focus:ring-4 focus:ring-blue-400/50 transition-all text-base"
              />

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 text-left">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        navigate(`/support/${item.id}`);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <span className="text-slate-700 font-medium">{item.q}</span>
                      <ChevronRight className="size-4 text-slate-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1000px] mx-auto px-6 py-12 relative z-20">
          {/* Popular Questions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              Câu hỏi phổ biến
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <FAQAccordion 
                question="Làm thế nào để tôi có thể hủy phòng đã đặt?" 
                answer={<>Bạn <strong>chỉ có thể tự hủy phòng khi đặt phòng đang ở trạng thái Chờ xử lý (Pending)</strong> - tức là chưa thực hiện thanh toán. Nếu phòng của bạn đã chuyển sang trạng thái <strong>Đã xác nhận (Confirmed)</strong>, bạn sẽ không thể tự hủy trên hệ thống. Vui lòng liên hệ CSKH.</>} 
              />
              <FAQAccordion 
                question="Thời gian nhận và trả phòng là khi nào?" 
                answer={<>Thời gian nhận phòng (Check-in) tiêu chuẩn là từ <strong>14:00 chiều</strong> và thời gian trả phòng (Check-out) là trước <strong>12:00 trưa</strong>.</>} 
              />
              <FAQAccordion 
                question="Tôi chưa thanh toán thì có được nhận phòng không?" 
                answer={<><strong>Không.</strong> Đơn đặt phòng của bạn bắt buộc phải được thanh toán thành công (trạng thái Confirmed) thì lễ tân mới có thể tiến hành thủ tục nhận phòng (Check-in) trên hệ thống.</>} 
              />
              <FAQAccordion 
                question="Tôi có thể đổi sang loại phòng khác sau khi đặt không?" 
                answer={<><strong>Có</strong>. Hệ thống hỗ trợ tính năng "Chuyển đổi phòng" thông qua lễ tân. Hệ thống sẽ tự động tính toán số tiền chênh lệch dựa trên giá loại phòng mới.</>} 
              />
            </div>
          </div>

          {/* Topics */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              Chủ đề nổi bật
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/support/how-to-book" className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all text-center group cursor-pointer">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="size-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Hướng dẫn đặt phòng</h3>
              </Link>
              <Link to="/support/account-management" className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all text-center group cursor-pointer">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <User className="size-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Tài khoản của bạn</h3>
              </Link>
              <Link to="/support/promotions-vouchers" className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-pink-500 hover:shadow-md transition-all text-center group cursor-pointer">
                <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Ticket className="size-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Mã ưu đãi</h3>
              </Link>
              <Link to="/support/before-booking" className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all text-center group cursor-pointer">
                <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="size-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Đơn đặt phòng</h3>
              </Link>
              
              <Link to="/support/payment-info" className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-center group cursor-pointer">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <CreditCard className="size-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Thanh toán</h3>
              </Link>
              <Link to="/support/refund-policy" className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-orange-500 hover:shadow-md transition-all text-center group cursor-pointer">
                <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <RefreshCw className="size-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Hủy & Hoàn tiền</h3>
              </Link>
              <Link to="/support/general-rules" className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all text-center group cursor-pointer">
                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Info className="size-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Quy định chung</h3>
              </Link>
              <Link to="/support/contact-us" className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-500 hover:shadow-md transition-all text-center group cursor-pointer">
                <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <HelpCircle className="size-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Hỗ trợ khác</h3>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f9fa] min-h-screen pb-20 pt-24 font-sans">
      <div className="max-w-[1200px] mx-auto px-6">
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-72 flex-shrink-0">
            {/* Search Box */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Tìm câu hỏi..."
                className="w-full bg-slate-100/80 border-none rounded-xl py-3 pl-10 pr-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 text-left">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        navigate(`/support/${item.id}`);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <span className="text-xs text-slate-700 font-medium">{item.q}</span>
                      <ChevronRight className="size-3 text-slate-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Menu */}
            <div className="space-y-1">
              {sidebarMenu.map((menu) => (
                <div key={menu.id} className="border-b border-slate-200/60 pb-2 mb-2 last:border-0">
                  <button 
                    onClick={() => toggleMenu(menu.id)}
                    className="w-full flex items-center justify-between py-3 text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors"
                  >
                    {menu.title}
                    <ChevronDown className={`size-4 text-slate-400 transition-transform ${openMenus[menu.id] ? "rotate-180" : ""}`} />
                  </button>
                  
                  {openMenus[menu.id] && (
                    <div className="flex flex-col gap-1 pb-2">
                      {menu.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => navigate(`/support/${item.id}`)}
                          className={`text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                            currentCategory === item.id 
                              ? "text-blue-600 font-bold bg-blue-50/50" 
                              : "text-slate-600 hover:text-blue-600 hover:bg-slate-100/50"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <nav className="text-xs font-medium text-blue-600 mb-6 flex items-center gap-2">
              <Link to="/support/help-center" className="hover:underline">Trợ giúp</Link>
              <ChevronRight className="size-3 text-slate-400" />
              <span className="text-blue-600 hover:underline cursor-pointer">{pageData.breadcrumb}</span>
              <ChevronRight className="size-3 text-slate-400" />
              <span className="text-slate-500">{pageData.title}</span>
            </nav>

            <h1 className="text-2xl lg:text-[28px] font-bold text-slate-800 mb-8">{pageData.title}</h1>
            
            <div className="mb-8">
              {pageData.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
