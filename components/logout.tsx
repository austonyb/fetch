import { Button } from "@/components/ui/button"

export default function Logout() {
    return (
        <div>
            <Button onClick={() => {
                fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                })
                .then(() => {
                    window.location.href = '/login'
                })
                .catch((error) => {
                    console.error('Logout error:', error)
                })
            }}>Logout</Button>
        </div>
    )
}