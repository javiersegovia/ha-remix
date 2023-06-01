import { redirect } from '@remix-run/server-runtime'
import { $path } from 'remix-routes'

export async function loader() {
  return redirect($path('/login'))
}
