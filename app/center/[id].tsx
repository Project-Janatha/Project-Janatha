import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Avatar,
  Button,
  Card,
  H1,
  H2,
  H3,
  Image,
  Paragraph,
  ScrollView,
  Separator,
  XStack,
  YStack
} from 'tamagui';
import { 
  ArrowLeft, 
  Share, 
  MapPin, 
  Globe, 
  Phone, 
  Calendar,
  User,
  ChevronRight,
  ChevronLeft,
  ThumbsUp,
  MessageCircle
} from '@tamagui/lucide-icons';

// Hardcoded center data
const centerData = {
  "1": {
    id: "1",
    name: "Chinmaya Mission San Jose",
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=250&fit=crop",
    address: "10160 Clayton Rd, San Jose, CA 95127",
    website: "https://www.cmsj.org/",
    phone: "+1 408 254 8392",
    upcomingEvents: 24,
    pointOfContact: "Ramesh Ji",
    acharya: "Acharya Brahmachari Soham Ji"
  },
  "2": {
    id: "2",
    name: "Chinmaya Mission West",
    image: "https://images.unsplash.com/photo-1464822759844-d150baec93d5?w=400&h=250&fit=crop",
    address: "560 Bridgeway, Sausalito, CA 94965",
    website: "https://www.chinmayamissionwest.org/",
    phone: "+1 415 332 2182",
    upcomingEvents: 18,
    pointOfContact: "Priya Ji",
    acharya: "Acharya Swami Ishwarananda"
  },
  "3": {
    id: "3",
    name: "Chinmaya Mission San Francisco",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
    address: "631 Irving St, San Francisco, CA 94122",
    website: "https://www.chinmayasf.org/",
    phone: "+1 415 661 8499",
    upcomingEvents: 15,
    pointOfContact: "Anjali Ji",
    acharya: "Acharya Swami Tejomayananda"
  }
};

// Sample events data for the calendar
const sampleEvents = [
  {
    id: 1,
    date: 26,
    time: "TODAY • 10:30 AM - 11:30 AM",
    location: "Young Museum",
    title: "Bhagavad Gita Study Circle - Chapter 12",
    attendees: 14,
    likes: 0,
    comments: 0,
    color: "red"
  },
  {
    id: 2,
    date: 29,
    time: "SUN, 8 PM - 11:49 PM", 
    location: "Meditation Hall",
    title: "Hanuman Chalisa Chanting Marathon",
    attendees: 14,
    likes: 0,
    comments: 0,
    color: "blue"
  },
  {
    id: 3,
    date: 31,
    time: "TUE, 7 PM - 8:30 PM",
    location: "Main Hall",
    title: "Yoga and Meditation Session",
    attendees: 8,
    likes: 2,
    comments: 1,
    color: "green"
  }
];

export default function CenterDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Details');
  
  const center = centerData[id as string];
  
  if (!center) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" px="$4">
        <H2>Center not found</H2>
        <Button onPress={() => router.back()} mt="$4">
          Go Back
        </Button>
      </YStack>
    );
  }

  // Calendar component
  const CalendarView = () => {
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const dates = [
      [null, null, null, null, 1, 2, 3],
      [4, 5, 6, 7, 8, 9, 10],
      [11, 12, 13, 14, 15, 16, 17],
      [18, 19, 20, 21, 22, 23, 24],
      [25, 26, 27, 28, 29, 30, 31]
    ];

    const getEventForDate = (date: number) => {
      return sampleEvents.find(event => event.date === date);
    };

    const getDateColor = (date: number) => {
      const event = getEventForDate(date);
      if (!event) return 'transparent';
      return event.color === 'red' ? '$red5' : event.color === 'blue' ? '$blue5' : '$green5';
    };

    return (
      <YStack gap="$4">
        {/* Calendar Header */}
        <XStack justifyContent="space-between" alignItems="center" px="$2">
          <Button size="$2" circular icon={<ChevronLeft size={16} />} variant="outlined" />
          <H2 fontSize="$5" fontWeight="600">August 2025</H2>
          <Button size="$2" circular icon={<ChevronRight size={16} />} variant="outlined" />
        </XStack>

        {/* Days of week header */}
        <XStack justifyContent="space-between" px="$2">
          {daysOfWeek.map((day, index) => (
            <YStack key={index} width={40} alignItems="center">
              <Paragraph fontSize="$3" color="$gray8" fontWeight="500">
                {day}
              </Paragraph>
            </YStack>
          ))}
        </XStack>

        {/* Calendar grid */}
        <YStack gap="$1">
          {dates.map((week, weekIndex) => (
            <XStack key={weekIndex} justifyContent="space-between" px="$2">
              {week.map((date, dayIndex) => (
                <YStack key={dayIndex} width={40} alignItems="center">
                  {date && (
                    <YStack 
                      width={36} 
                      height={36} 
                      borderRadius="$3" 
                      justifyContent="center" 
                      alignItems="center"
                      bg={date === 26 ? "$gray12" : getDateColor(date)}
                      position="relative"
                    >
                      <Paragraph 
                        fontSize="$3" 
                        fontWeight={date === 26 ? "600" : "400"}
                        color={date === 26 ? "$gray2" : "$color"}
                      >
                        {date}
                      </Paragraph>
                      {getEventForDate(date) && date !== 26 && (
                        <YStack 
                          position="absolute" 
                          bottom={2} 
                          width={4} 
                          height={4} 
                          borderRadius={2}
                          bg={getEventForDate(date)?.color === 'red' ? '$red9' : 
                              getEventForDate(date)?.color === 'blue' ? '$blue9' : '$green9'}
                        />
                      )}
                    </YStack>
                  )}
                </YStack>
              ))}
            </XStack>
          ))}
        </YStack>

        {/* Today's events */}
        <YStack gap="$3" mt="$2">
          {sampleEvents.filter(event => event.date === 26).map((event) => (
            <Card key={event.id} elevate size="$4">
              <Card.Header p="$4">
                <YStack gap="$2">
                  <Paragraph fontSize="$3" color="$primary" fontWeight="500">
                    {event.time}
                  </Paragraph>
                  <Paragraph fontSize="$3" color="$gray8">
                    {event.location}
                  </Paragraph>
                  <H3 fontSize="$4" fontWeight="600" lineHeight="$1">
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

          {sampleEvents.filter(event => event.date !== 26).map((event) => (
            <Card key={event.id} elevate size="$4" opacity={0.8}>
              <Card.Header p="$4">
                <YStack gap="$2">
                  <Paragraph fontSize="$3" color="$primary" fontWeight="500">
                    {event.time}
                  </Paragraph>
                  <Paragraph fontSize="$3" color="$gray8">
                    {event.location}
                  </Paragraph>
                  <H3 fontSize="$4" fontWeight="600" lineHeight="$1">
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
      </YStack>
    );
  };

  return (
    <ScrollView flex={1} bg="$background">
      <YStack flex={1}>
        {/* Center Title */}
        <YStack px="$4" py="$3" bg="$background" borderBottomWidth={1} borderBottomColor="$borderColor">
          <H1 fontSize="$6" fontWeight="600" textAlign="center">
            {center.name}
          </H1>
        </YStack>

        {/* Tab Navigation */}
        <XStack bg="$background" px="$4" py="$2">
          <XStack flex={1} bg="$gray3" borderRadius="$3" p="$1">
            <Button 
              flex={1} 
              bg={activeTab === 'Details' ? "$orange5" : "transparent"} 
              color={activeTab === 'Details' ? "$orange11" : "$gray10"} 
              size="$3" 
              borderRadius="$2"
              onPress={() => setActiveTab('Details')}
            >
              Details
            </Button>
            <Button 
              flex={1} 
              bg={activeTab === 'Event' ? "$orange5" : "transparent"} 
              color={activeTab === 'Event' ? "$orange11" : "$gray10"} 
              size="$3"
              onPress={() => setActiveTab('Event')}
            >
              Event
            </Button>
          </XStack>
        </XStack>

        <YStack px="$4" gap="$4" pb="$8">
          {activeTab === 'Details' ? (
            <>
              {/* Center Image */}
              <Card elevate size="$4">
                <Card.Header p="$0">
                  <Image
                    source={{ uri: center.image }}
                    width="100%"
                    height={200}
                    borderRadius="$4"
                    borderBottomLeftRadius={0}
                    borderBottomRightRadius={0}
                  />
                </Card.Header>
              </Card>

              {/* Address */}
              <XStack alignItems="center" gap="$3">
                <MapPin size={20} color="$primary" />
                <YStack flex={1}>
                  <Paragraph fontSize="$4" fontWeight="500" color="$color">
                    {center.address}
                  </Paragraph>
                </YStack>
              </XStack>

              {/* Website */}
              <XStack alignItems="center" gap="$3">
                <Globe size={20} color="$primary" />
                <YStack flex={1}>
                  <Paragraph fontSize="$4" color="$blue10" textDecorationLine="underline">
                    {center.website}
                  </Paragraph>
                </YStack>
              </XStack>

              {/* Phone */}
              <XStack alignItems="center" gap="$3">
                <Phone size={20} color="$primary" />
                <YStack flex={1}>
                  <Paragraph fontSize="$4" color="$blue10">
                    {center.phone}
                  </Paragraph>
                </YStack>
              </XStack>

              <Separator my="$2" />

              {/* Upcoming Events */}
              <XStack justifyContent="space-between" alignItems="center">
                <XStack alignItems="center" gap="$3">
                  <Calendar size={20} color="$primary" />
                  <Paragraph fontSize="$4" fontWeight="500">
                    {center.upcomingEvents} upcoming events
                  </Paragraph>
                </XStack>
                <Button size="$2" variant="outlined" color="$primary">
                  See All
                </Button>
              </XStack>

              <Separator my="$2" />

              {/* Point of Contact */}
              <XStack alignItems="center" gap="$3">
                <User size={20} color="$primary" />
                <YStack flex={1}>
                  <Paragraph fontSize="$3" color="$gray10">
                    Point of Contact: 
                  </Paragraph>
                  <Paragraph fontSize="$4" fontWeight="500">
                    {center.pointOfContact}
                  </Paragraph>
                </YStack>
              </XStack>

              {/* Acharya */}
              <XStack alignItems="center" gap="$3">
                <User size={20} color="$primary" />
                <YStack flex={1}>
                  <Paragraph fontSize="$3" color="$gray10">
                    Acharya: 
                  </Paragraph>
                  <Paragraph fontSize="$4" fontWeight="500">
                    {center.acharya}
                  </Paragraph>
                </YStack>
              </XStack>

              {/* Make this my center button */}
              <Button 
                size="$4" 
                bg="$orange8" 
                color="$backgroundStrong" 
                fontWeight="600"
                mt="$4"
                pressStyle={{ bg: "$orange9" }}
              >
                Make this my center
              </Button>
            </>
          ) : (
            <CalendarView />
          )}
        </YStack>
      </YStack>
    </ScrollView>
  );
}
