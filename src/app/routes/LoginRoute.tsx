import { LoginScreen } from '../../features/auth/LoginScreen'
import { useLoginViewModel } from '../../features/auth/useLoginViewModel'

export function LoginRoute() {
  return <LoginScreen {...useLoginViewModel()} />
}
