import React, { useContext } from 'react';
import { MapPin, ChevronRight, Users, ThumbsUp, MessageCircle } from '@tamagui/lucide-icons'
import { 
  Anchor, 
  Avatar, 
  Button, 
  Card, 
  H1, 
  H2, 
  H3, 
  Paragraph, 
  ScrollView, 
  Separator, 
  XStack, 
  YStack 
} from 'tamagui'
import { ToastControl } from 'components/CurrentToast'
import { UserContext } from 'components';
import { useRouter } from 'expo-router';

type User = {
  username?: string;
  // add other user properties if needed
};

/**
 * HomeScreen Component
 * @return {JSX.Element} A HomeScreen component that displays the main dashboard with events and calendar.
 */
export default function HomeScreen() {
  const { user, isAuthenticated } = useContext(UserContext);
  const router = useRouter();
  console.log("User in HomeScreen:", user);

  // Hardcoded data for demo
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const userName = user?.username || "Pranav";

  // Map pin locations data
  const mapPins = [
    { id: "1", name: "Chinmaya Mission San Jose", x: "65%", y: "45%" },
    { id: "2", name: "Chinmaya Mission West", x: "25%", y: "25%" },
    { id: "3", name: "Chinmaya Mission San Francisco", x: "35%", y: "35%" },
  ];

  const handlePinClick = (pinId: string) => {
    router.push(`/center/${pinId}`);
  };

  // Calendar data - showing current week
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const weekDates = [18, 19, 20, 21, 22, 23, 24];
  const today = 19; // Hardcoded to match design

  // Event data
  const events = [
    {
      id: 1,
      time: "TODAY • 10:30 AM - 11:30 AM",
      location: "Young Museum",
      title: "Bhagavad Gita Study Circle - Chapter 12",
      attendees: 14,
      likes: 0,
      comments: 0
    },
    {
      id: 2,
      time: "SUN, 8 PM - 11:49 PM",
      location: "Meditation Hall",
      title: "Hanuman Chalisa Chanting Marathon",
      attendees: 14,
      likes: 0,
      comments: 0
    }
  ];

  return (
    <ScrollView flex={1} bg="$background">
      <YStack flex={1} gap="$4" px="$4" pt="$4" pb="$8">
        
        {/* Header with Welcome and Profile */}
        <XStack justifyContent="space-between" alignItems="center" mb="$2">
          <H1 fontSize="$8" fontWeight="bold" color="$color">
            Welcome {userName}
          </H1>
          <Avatar size="$4" circular>
            <Avatar.Image 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" 
            />
            <Avatar.Fallback bg="$primary" />
          </Avatar>
        </XStack>

        {/* Map Placeholder Section */}
        <Card elevate size="$4" mb="$4">
          <Card.Header p="$0">
            <YStack 
              height={200} 
              bg="$gray5" 
              borderRadius="$4" 
              justifyContent="center" 
              alignItems="center"
              position="relative"
            >
              {/* Map background elements */}
              <YStack 
                position="absolute" 
                bg="$blue4" 
                width={120} 
                height={80} 
                borderRadius="$2" 
                opacity={0.2}
                top="$6"
                right="$4"
              />
              
              <YStack 
                position="absolute" 
                bg="$green4" 
                width={90} 
                height={60} 
                borderRadius="$2" 
                opacity={0.2}
                top="$2"
                left="$6"
              />

              {/* Clickable Map Pins */}
              {mapPins.map((pin) => (
                <Button
                  key={pin.id}
                  position="absolute"
                  top={pin.y}
                  left={pin.x}
                  size="$2.5"
                  circular
                  bg="$red9"
                  borderWidth={3}
                  borderColor="white"
                  pressStyle={{ 
                    scale: 1.1, 
                    bg: "$red10" 
                  }}
                  hoverStyle={{ 
                    scale: 1.05,
                    bg: "$red8" 
                  }}
                  onPress={() => handlePinClick(pin.id)}
                  shadowColor="$shadowColor"
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.3}
                  shadowRadius={4}
                  elevation={3}
                >
                  <MapPin size={16} color="white" />
                </Button>
              ))}
              
              <Paragraph fontSize="$6" color="$gray8" textAlign="center" opacity={0.7}>
                🗺️ Interactive Map
              </Paragraph>
              <Paragraph fontSize="$3" color="$gray7" textAlign="center" mt="$2" opacity={0.7}>
                Tap pins to explore centers
              </Paragraph>
            </YStack>
          </Card.Header>
          
          <Card.Footer p="$3">
            <XStack justifyContent="space-between" alignItems="center" width="100%">
              <XStack alignItems="center" gap="$2">
                <MapPin size={20} color="$primary" />
                <Paragraph fontSize="$4" fontWeight="500">
                  Find events near you
                </Paragraph>
              </XStack>
              <ChevronRight size={20} color="$gray8" />
            </XStack>
          </Card.Footer>
        </Card>

        {/* Your Week Section */}
        <YStack gap="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <H2 fontSize="$6" fontWeight="600">Your week</H2>
            <Button size="$2" variant="outlined" color="$primary">
              See All
            </Button>
          </XStack>

          {/* Calendar Week View */}
          <XStack justifyContent="space-between" px="$2">
            {weekDays.map((day, index) => (
              <YStack key={index} alignItems="center" gap="$2" minWidth={40}>
                <Paragraph fontSize="$3" color="$gray8" fontWeight="500">
                  {day}
                </Paragraph>
                <YStack 
                  width={36} 
                  height={36} 
                  borderRadius="$3" 
                  justifyContent="center" 
                  alignItems="center"
                  bg={weekDates[index] === today ? "$yellow5" : "transparent"}
                >
                  <Paragraph 
                    fontSize="$4" 
                    fontWeight={weekDates[index] === today ? "600" : "400"}
                    color={weekDates[index] === today ? "$yellow11" : "$color"}
                  >
                    {weekDates[index]}
                  </Paragraph>
                </YStack>
              </YStack>
            ))}
          </XStack>
        </YStack>

        {/* Events List */}
        <YStack gap="$3" mt="$4">
          {events.map((event, index) => (
            <Card key={event.id} elevate size="$4" pressStyle={{ scale: 0.98 }}>
              <Card.Header p="$4">
                <YStack gap="$2">
                  <Paragraph fontSize="$3" color="$primary" fontWeight="500">
                    {event.time}
                  </Paragraph>
                  <Paragraph fontSize="$3" color="$gray8">
                    {event.location}
                  </Paragraph>
                  <H3 fontSize="$5" fontWeight="600" lineHeight="$1">
                    {event.title}
                  </H3>
                  <Paragraph fontSize="$3" color="$gray8" mt="$1">
                    {event.attendees} people
                  </Paragraph>
                </YStack>
              </Card.Header>

              <Card.Footer p="$4" pt="$0">
                <XStack justifyContent="flex-end" gap="$4" width="100%">
                  <XStack alignItems="center" gap="$1">
                    <ThumbsUp size={16} color="$gray8" />
                    <Paragraph fontSize="$3" color="$gray8">
                      {event.likes}
                    </Paragraph>
                  </XStack>
                  <XStack alignItems="center" gap="$1">
                    <MessageCircle size={16} color="$gray8" />
                    <Paragraph fontSize="$3" color="$gray8">
                      {event.comments}
                    </Paragraph>
                  </XStack>
                </XStack>
              </Card.Footer>
            </Card>
          ))}
        </YStack>

        <ToastControl />
      </YStack>
    </ScrollView>
  )
}
