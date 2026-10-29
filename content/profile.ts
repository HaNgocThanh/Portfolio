export interface SocialLink {
  key: "github" | "linkedin" | "instagram" | "tiktok" | "email" | "whatsapp"
  name: string
  label: string
  href: string
}

// Public template content; replace with your own details. Never add secrets here.
export const profile = {
  name: "Hà Ngọc Thành",
  shortName: "Thành",
  brand: "Thành",
  copyrightName: "NgocThanh",
  role: "Fullstack Web Developer",
  roles: ["Frontend Developer", "Backend Developer", "Fullstack Developer"],
  language: "vi",
  locale: "vi_VN",
  dateLocale: "vi-VN",
  chatLanguage: "tiếng Việt",
  siteUrl: "",
  image: "/images/hero.jpg",
  cv: "/Hà_Ngọc_Thành_CV.pdf",
  email: "hangocthanh2005@gmail.com",
  phone: "+84 903563935",
  whatsapp: true,
  birthplace: "Đắk Lắk, Việt Nam",
  location: "Hồ Chí Minh, Việt Nam",
  education: "HUFLIT",
  gpa: "",
  intro: "Xin chào, tôi là Hà Ngọc Thành. Tôi theo đuổi phát triển web fullstack, kết nối giao diện dễ sử dụng với hệ thống xử lý dữ liệu để biến ý tưởng thành ứng dụng thiết thực.",
  biography: "Tôi định hướng trở thành lập trình viên fullstack, tìm hiểu cách xây dựng một ứng dụng web từ giao diện đến API và cơ sở dữ liệu. Qua quá trình học tập và thực hành, tôi rèn luyện tư duy giải quyết vấn đề, cách tổ chức mã nguồn và khả năng kết nối các thành phần thành một sản phẩm hoàn chỉnh.",
  approach: "Tôi bắt đầu bằng việc làm rõ nhu cầu người dùng và luồng hoạt động của ứng dụng, sau đó chia nhỏ công việc để triển khai và kiểm tra từng phần. Tôi ưu tiên giao diện dễ thao tác, mã nguồn dễ hiểu và sự nhất quán giữa frontend, API và dữ liệu, đồng thời cải thiện sản phẩm dựa trên phản hồi thực tế.",
  highlights: ["Định hướng Fullstack", "Giao diện dễ sử dụng", "Kết nối API & dữ liệu"],
  seoDescription: "Personal portfolio of Hà Ngọc Thành. Software Developer specializing in Next.js, Node.js, and modern web development.",
  twitterHandle: "@HàNgọcThành",
  googleVerification: "",
  map: {
    title: "Tân Phú, Hồ Chí Minh, Việt Nam",
    location: "Hồ Chí Minh",
    embedUrl: "https://maps.google.com/maps?q=T%C3%A2n%20Ph%C3%BA%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh%2C%20Vi%E1%BB%87t%20Nam&output=embed",
  },
  socials: [
    { key: "github", name: "GitHub", label: "RyHarJr", href: "https://github.com/RyHarJr" },
    { key: "linkedin", name: "LinkedIn", label: "Rizki Hartawan", href: "https://www.linkedin.com/in/rizkihartawan/" },
    { key: "instagram", name: "Instagram", label: "@rizki_hr4", href: "https://instagram.com/rizki_hr4" },
    { key: "tiktok", name: "TikTok", label: "@ryhar.dev", href: "https://tiktok.com/@ryhar.dev" },
  ] satisfies SocialLink[],
}

export function getContactLinks(): SocialLink[] {
  const email: SocialLink[] = profile.email ? [{ key: "email", name: "Email", label: profile.email, href: "mailto:" + profile.email }] : []
  const whatsapp: SocialLink[] = profile.whatsapp && profile.phone ? [{ key: "whatsapp", name: "WhatsApp", label: profile.phone, href: "https://wa.me/" + profile.phone.replace(/\D/g, "") }] : []
  return [...profile.socials.filter(link => link.key === "github"), ...email, ...whatsapp, ...profile.socials.filter(link => link.key !== "github")]
}

export const assistantName = profile.brand + " Assistant"
export const chatWelcome = "Xin chào! Tôi là trợ lý AI của " + profile.brand + ". Bạn muốn tìm hiểu về kỹ năng, kinh nghiệm hay các dự án của " + profile.brand + "?"

