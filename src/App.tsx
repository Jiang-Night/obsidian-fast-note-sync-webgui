import { RegisterForm } from "@/components/user/register-form";
import { VaultList } from "@/components/vault/vault-list";
import { LoginForm } from "@/components/user/login-form";
import { ChangePassword } from "@/components/user/change-password";
import { CirclePlus, Pencil, Trash2, Check, User, LogOut, Clipboard, Info } from "lucide-react"

import { useState } from "react";

import { useAuth } from "./components/context/auth-context";


function App() {
  const { isLoggedIn, login, logout } = useAuth()

  const [isRegistering, setIsRegistering] = useState(false)
  const [activeMenu, setActiveMenu] = useState('vaults')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)

  const handleLoginSuccess = () => {
    login()
  }

  const handleRegisterSuccess = () => {
    login()
    setIsRegistering(false)
  }

  const menuItems = [
    { id: 'vaults', label: '笔记仓库管理' },
    { id: 'notes', label: '笔记管理' },
    { id: 'sync', label: '远程同步管理' },
  ]

  return (
    <div className="flex justify-center">
      <div className="flex flex-col rounded-lg border text-card-foreground shadow-sm w-[1000px] m-10 bg-gray-50">
        {/* Top Navigation Bar - Now spans full width */}
        <div className="border-b px-6 py-3 flex items-center justify-between bg-gray-50 rounded-t-lg">
          {/* Logo and Site Name */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">OS</span>
            </div>
            <span className="text-xl font-semibold">Obsidian Sync</span>
          </div>

          {/* User Actions */}
          {isLoggedIn && (
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-2 hover:bg-gray-100 rounded-full p-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600">U</span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border">
                  <button
                    onClick={() => {
                      setShowChangePassword(true)
                      setShowUserMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    修改密码
                  </button>
                  <button
                    onClick={() => {
                      logout()
                      setShowUserMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    退出登录
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Area with Sidebar and Main Content */}
        <div className="flex flex-1">
          {/* Left Sidebar - Only show when logged in */}
          {isLoggedIn && (
            <div className="w-48 border-r p-4">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">功能导航</h2>
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeMenu === item.id ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}>
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={`flex-1 py-12 px-4 sm:px-6 lg:px-8 ${!isLoggedIn ? "w-full" : ""}`}>
            {isLoggedIn ? (
              showChangePassword ? (
                <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold mb-4">修改密码</h2>
                  <ChangePassword close={() => setShowChangePassword(false)} />
                </div>
              ) : (
                <VaultList />
              )
            ) : isRegistering ? (
              <RegisterForm onSuccess={handleRegisterSuccess} onBackToLogin={() => setIsRegistering(false)} />
            ) : (
              <LoginForm onSuccess={handleLoginSuccess} onRegister={() => setIsRegistering(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
