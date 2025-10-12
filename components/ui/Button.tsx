import { Pressable, Text } from "react-native";

const Button = ({ children}) => {
  return (
    <Pressable className="bg-primary p-4 rounded">
      <Text className="text-white">{children}</Text>
    </Pressable>
  );
};

export default Button;
