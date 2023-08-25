
import Providers from './Providers';
import Pugb from './Pugb';
import { useFonts } from 'expo-font';
let customFonts = {
  'Righteous': require('./assets/Righteous-Regular.ttf')
};

export default function App() {
  const [isLoaded] = useFonts(customFonts);

  return (
    <Providers>
      {isLoaded &&
        <Pugb />
      }
    </Providers>
  );
}
