import IdentifyWebsite from './identify-website'
import Asklogo from '@/ui/shared/icons/asklogo';

const Header = () => {
  return (
    <div className="sticky left-0 top-0 w-full">
      <div>
        <IdentifyWebsite />
      </div>
    </div>
  );
};

export default Header;
