import { FaTachometerAlt, FaPlusCircle, FaLayerGroup, FaSignOutAlt } from "react-icons/fa";

const Sidebar = () => {
  const links = [
    { name: "Dashboard", href: "https://github.com/", icon: FaTachometerAlt, active: true },
    { name: "Create New Course", href: "https://github.com/", icon: FaPlusCircle, active: false },
    { name: "My Courses", href: "https://github.com/", icon: FaLayerGroup, active: false },
  ];

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col justify-between p-4">
      {/* Logo and Brand */}
      <div className="flex items-center space-x-2">
        <img src="frontend\src\assets\LOGO.png" alt="Logo" className="w-8 h-8" />
        <h1 className="text-lg font-bold">TALIM</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col space-y-4 mt-6">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
              link.active ? "bg-purple-700" : "hover:text-purple-400"
            }`}
          >
            <link.icon className="w-5 h-5" />
            <span>{link.name}</span>
          </a>
        ))}
      </nav>

      {/* Sign-out */}
      <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white">
        <FaSignOutAlt className="w-5 h-5" />
        <span>Sign-out</span>
      </a>
    </div>
  );
};

export default Sidebar;
