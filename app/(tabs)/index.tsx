import React, { useContext } from 'react';
import { MapPin, ChevronRight, Users, ThumbsUp, MessageCircle, Calendar } from '@tamagui/lucide-icons'
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
import { UserContext, Map } from 'components';
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

  // Map points data - centers and events with proper coordinates
  const mapPoints = [
    {
      id: "1",
      type: "center" as const,
      name: "Chinmaya Mission San Jose",
      latitude: 37.2431,
      longitude: -121.7831,
    },
    {
      id: "2", 
      type: "center" as const,
      name: "Chinmaya Mission West",
      latitude: 37.8599,
      longitude: -122.4856,
    },
    {
      id: "3",
      type: "center" as const, 
      name: "Chinmaya Mission San Francisco",
      latitude: 37.7749,
      longitude: -122.4194,
    },
    {
      id: "1",
      type: "event" as const,
      name: "Bhagavad Gita Study Circle",
      latitude: 37.2631,
      longitude: -121.8031,
    },
    {
      id: "2",
      type: "event" as const,
      name: "Hanuman Chalisa Chanting",
      latitude: 37.8699,
      longitude: -122.4756,
    },
    {
      id: "3",
      type: "event" as const,
      name: "Yoga and Meditation Session",
      latitude: 37.7849,
      longitude: -122.4094,
    },
  ];

  const handlePointPress = (point: any) => {
    if (point.type === 'center') {
      router.push(`/center/${point.id}`);
    } else if (point.type === 'event') {
      router.push(`/events/${point.id}`);
    }
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

        {/* Interactive Map Section */}
        <Card elevate size="$4" mb="$4">
          <Card.Header p="$0">
            <YStack height={200} borderRadius="$4" overflow="hidden">
              <Map points={mapPoints} onPointPress={handlePointPress} />
            </YStack>
          </Card.Header>
          
          <Card.Footer p="$3">
            <XStack 
              justifyContent="space-between" 
              alignItems="center" 
              width="100%"
              pressStyle={{ opacity: 0.7 }}
              hoverStyle={{ bg: "$gray2" }}
              onPress={() => router.push('/explore')}
              cursor="pointer"
              borderRadius="$3"
              padding="$2"
              marginHorizontal="-$2"
            >
              <XStack alignItems="center" gap="$2">
                <MapPin size={20} color="$primary" />
                <Paragraph fontSize="$4" fontWeight="500">
                  Find centers and events near you
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
