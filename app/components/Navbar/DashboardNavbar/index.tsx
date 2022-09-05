import { DropdownMenu } from './DropdownMenu'
import { BsLayoutSidebarInset } from 'react-icons/bs'
import { HiOutlineMenu } from 'react-icons/hi'
import type { AdminUser, User } from '@prisma/client'
// import { Web3Data } from '@components/Blockchain/Web3Data'

interface DashboardNavbarProps {
  setShowSideBar: (arg: boolean) => void
  user: Pick<User, 'firstName' | 'email'> | Pick<AdminUser, 'email'>
  isAdmin: boolean
}

export const DashboardNavbar = ({
  setShowSideBar,
  user,
  isAdmin = false,
}: DashboardNavbarProps) => {
  // const { data: user } = useCurrentUserQuery()
  // const { data: adminUser } = useCurrentAdminUserQuery()

  return (
    <header className="flex h-16 w-full items-center rounded-t-[15px] border-b bg-white px-4">
      <button
        type="button"
        onClick={() => setShowSideBar(true)}
        className="flex h-full items-center text-3xl text-gray-700 hover:text-cyan-600 md:hidden"
      >
        <span className="sr-only">Menu</span>
        <BsLayoutSidebarInset />
      </button>

      <div className="ml-auto" />

      {/* {adminUser && (
        <div className="ml-auto mr-4">
          <Web3Data />
        </div>
      )} */}

      <div className="width[1px] mr-4 h-full bg-gray-200" />

      <div>
        <div className="flex items-center space-x-4 border-0">
          {user ? (
            <DropdownMenu user={user} isAdmin={isAdmin} />
          ) : (
            <button
              type="button"
              className="flex h-full items-center text-3xl text-gray-700 hover:text-cyan-600"
            >
              <HiOutlineMenu />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
