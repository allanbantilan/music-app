import { Component, ReactNode } from "react";
import { View, Text, Pressable } from "react-native";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Stops one screen's render error from unmounting the whole app (which shows
 * as a blank screen everywhere). Shows the message + a retry instead.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.log("[error-boundary]", error?.message);
  }

  render() {
    if (this.state.error) {
      return (
        <View className="flex-1 items-center justify-center bg-yt-bg px-6">
          <Text className="mb-3 text-center text-yt-textPrimary">
            Something broke on this screen.
          </Text>
          <Text className="mb-6 text-center text-xs text-yt-textSecondary">
            {this.state.error.message}
          </Text>
          <Pressable
            onPress={() => this.setState({ error: null })}
            className="rounded-full bg-yt-textPrimary px-6 py-2"
          >
            <Text className="font-bold text-yt-bg">Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}
