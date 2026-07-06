import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { User, LogOut, Settings, Image as ImageIcon, Package, Heart } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function ProfileMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (user) {
      supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setIsAdmin(data.is_admin)
            setProfile(data)
          }
        })
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full ml-1 hover:bg-muted/50 transition-colors"
        >
          <Avatar className="h-9 w-9 border border-border/50">
            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
              {profile?.full_name?.charAt(0)?.toUpperCase() ||
                user.email?.charAt(0)?.toUpperCase() ||
                'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mt-1" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-3 bg-muted/20">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.full_name || 'Usuário'}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-0" />
        <div className="p-1">
          <DropdownMenuItem asChild className="cursor-pointer py-2">
            <Link to="/meus-pedidos" className="w-full flex items-center">
              <Package className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Meus Pedidos</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer py-2">
            <Link to="/favoritos" className="w-full flex items-center">
              <Heart className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Favoritos</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer py-2">
            <Link to="/troca-e-devolucao" className="w-full flex items-center">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Troca e Devolução</span>
            </Link>
          </DropdownMenuItem>
        </div>

        {isAdmin && (
          <>
            <DropdownMenuSeparator className="my-0" />
            <div className="p-2 pb-1">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider px-2 mb-1">
                Administração
              </p>
              <DropdownMenuItem asChild className="cursor-pointer py-2">
                <Link to="/admin/upload" className="w-full flex items-center">
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Painel Admin</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer py-2">
                <Link to="/admin/appearance" className="w-full flex items-center">
                  <ImageIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Aparência</span>
                </Link>
              </DropdownMenuItem>
            </div>
          </>
        )}

        <DropdownMenuSeparator className="my-0" />
        <div className="p-1">
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-red-600 cursor-pointer py-2 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair da conta</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
