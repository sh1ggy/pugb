import { Provider } from "jotai"
import config from './tamagui.config'
import { TamaguiProvider } from "tamagui"
export default function Providers({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode
}) {
  return (
    <Provider>
      <TamaguiProvider config={config}>
        {children}
      </TamaguiProvider>
    </Provider>
  )
}