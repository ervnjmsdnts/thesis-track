import { Button } from '@/components/ui/button';
import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/server';

export default function Home() {
  return (
    <div>
      <Button asChild>
        <LoginLink>Log in</LoginLink>
      </Button>
      <Button asChild>
        <RegisterLink>Register</RegisterLink>
      </Button>
    </div>
  );
}
