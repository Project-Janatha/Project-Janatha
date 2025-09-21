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
  Clock, 
  Users, 
  Info,
  MessageCircle,
  Calendar
} from '@tamagui/lucide-icons';
import { TabSegment, SecondaryButton, PrimaryButton } from 'components';

// Hardcoded event data
const eventData = {
  "1": {
    id: "1",
    title: "Bhagavad Gita Study Circle - Chapter 12",
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=250&fit=crop",
    time: "Today · 10:30 AM - 11:30 AM",
    location: "Chinmaya Mission San Jose",
    address: "10160 Clayton Rd, San Jose, CA 95127",
    attendees: 14,
    pointOfContact: "Ramesh Ji",
    description: "Join us for an in-depth study of Chapter 12 of the Bhagavad Gita, focusing on Bhakti Yoga and the path of devotion. This session will explore the qualities of a true devotee and practical ways to cultivate devotion in daily life.",
    isRegistered: true,
    attendeesList: [
      {
        id: 1,
        name: "Theresa Hebert",
        role: "Design manager @Setproduct",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: 2,
        name: "Jessica Chlen",
        role: "Chief Design Officer",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: 3,
        name: "Diana Shelton",
        role: "Senior UX designer",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: 4,
        name: "Annie Huy Long",
        role: "Digital designer & Motion expert",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: 5,
        name: "Morgan Melendez",
        role: "Just a good girl",
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face"
      }
    ],
    messages: [
      {
        id: 1,
        sender: "Jessica Chlen",
        time: "3:30PM · 19 August 2025",
        message: "Thank you everyone who could attend!",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: 2,
        sender: "Jessica Chlen",
        time: "9:20AM · 18 August 2025",
        message: "We will be meeting on the 14th floor.",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
      }
    ]
  },
  "2": {
    id: "2",
    title: "Hanuman Chalisa Chanting Marathon",
    image: "https://images.unsplash.com/photo-1464822759844-d150baec93d5?w=400&h=250&fit=crop",
    time: "SUN, 8 PM - 11:49 PM",
    location: "Meditation Hall",
    address: "10160 Clayton Rd, San Jose, CA 95127",
    attendees: 14,
    pointOfContact: "Priya Ji",
    description: "Join us for a powerful chanting session of the Hanuman Chalisa. This marathon will help purify the mind and strengthen devotion to Lord Hanuman.",
    isRegistered: false,
    attendeesList: [],
    messages: []
  },
  "3": {
    id: "3",
    title: "Yoga and Meditation Session",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
    time: "TUE, 7 PM - 8:30 PM",
    location: "Main Hall",
    address: "10160 Clayton Rd, San Jose, CA 95127",
    attendees: 8,
    pointOfContact: "Anjali Ji",
    description: "A peaceful session combining gentle yoga postures with guided meditation to help you find inner peace and balance.",
    isRegistered: false,
    attendeesList: [],
    messages: []
  }
};

export default function EventDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Details');
  
  const event = eventData[id as string];
  
  if (!event) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" px="$4">
        <H2>Event not found</H2>
        <SecondaryButton onPress={() => router.back()} mt="$4">
          Go Back
        </SecondaryButton>
      </YStack>
    );
  }

  const renderDetailsTab = () => (
    <YStack gap="$4">
      {/* Event Image */}
      <Card elevate size="$4">
        <Card.Header p="$0">
          <Image
            source={{ uri: event.image }}
            width="100%"
            height={200}
            borderRadius="$4"
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
          />
        </Card.Header>
      </Card>

      {/* Event Information */}
      <YStack gap="$3">
        {/* Time */}
        <XStack alignItems="center" gap="$3">
          <Clock size={20} color="$primary" />
          <Paragraph fontSize="$4" fontWeight="500" color="$color">
            {event.time}
          </Paragraph>
        </XStack>

        {/* Location */}
        <XStack alignItems="center" gap="$3">
          <MapPin size={20} color="$primary" />
          <YStack flex={1}>
            <Paragraph fontSize="$4" fontWeight="500" color="$color">
              {event.location}
            </Paragraph>
            <Paragraph fontSize="$3" color="$gray8">
              {event.address}
            </Paragraph>
          </YStack>
        </XStack>

        {/* Attendees */}
        <XStack alignItems="center" gap="$3">
          <Users size={20} color="$primary" />
          <Paragraph fontSize="$4" fontWeight="500" color="$color">
            {event.attendees} People Going
          </Paragraph>
        </XStack>

        {/* Point of Contact */}
        <XStack alignItems="center" gap="$3">
          <Info size={20} color="$primary" />
          <YStack flex={1}>
            <Paragraph fontSize="$3" color="$gray10">
              Point of Contact:
            </Paragraph>
            <Paragraph fontSize="$4" fontWeight="500">
              {event.pointOfContact}
            </Paragraph>
          </YStack>
        </XStack>

        {/* Description */}
        <YStack gap="$2" mt="$2">
          <H3 fontSize="$4" fontWeight="600">
            About this event
          </H3>
          <Paragraph fontSize="$4" color="$gray10" lineHeight="$1">
            {event.description}
          </Paragraph>
        </YStack>
      </YStack>

      {/* Registration Status and Action Button */}
      {event.isRegistered ? (
        <YStack gap="$3" mt="$4">
          <Paragraph fontSize="$4" color="$green10" fontWeight="500">
            You are registered for this event!
          </Paragraph>
          <SecondaryButton 
            size="$4" 
          >
            Cancel Registration
          </SecondaryButton>
        </YStack>
      ) : (
        <PrimaryButton 
          size="$4" 
          mt="$4"
        >
          Attend Event
        </PrimaryButton>
      )}
    </YStack>
  );

  const renderPeopleTab = () => (
    <YStack gap="$3">
      {event.attendeesList.length > 0 ? (
        event.attendeesList.map((attendee) => (
          <Card key={attendee.id} elevate size="$3">
            <Card.Header p="$4">
              <XStack alignItems="center" gap="$3">
                <Avatar circular size="$4">
                  <Avatar.Image source={{ uri: attendee.avatar }} />
                  <Avatar.Fallback backgroundColor="$gray5" />
                </Avatar>
                <YStack flex={1}>
                  <Paragraph fontSize="$4" fontWeight="500">
                    {attendee.name}
                  </Paragraph>
                  <Paragraph fontSize="$3" color="$gray8">
                    {attendee.role}
                  </Paragraph>
                </YStack>
              </XStack>
            </Card.Header>
          </Card>
        ))
      ) : (
        <YStack alignItems="center" py="$8">
          <Users size={48} color="$gray8" />
          <Paragraph fontSize="$4" color="$gray8" mt="$3">
            No attendees yet
          </Paragraph>
        </YStack>
      )}
    </YStack>
  );

  const renderMessagesTab = () => (
    <YStack gap="$3">
      {event.messages.length > 0 ? (
        <>
          <Card elevate size="$3" bg="$gray3">
            <Card.Header p="$4">
              <Paragraph fontSize="$3" color="$gray8" textAlign="center">
                Only the host can post messages
              </Paragraph>
            </Card.Header>
          </Card>
          
          {event.messages.map((message) => (
            <Card key={message.id} elevate size="$3">
              <Card.Header p="$4">
                <XStack alignItems="flex-start" gap="$3">
                  <Avatar circular size="$3">
                    <Avatar.Image source={{ uri: message.avatar }} />
                    <Avatar.Fallback backgroundColor="$gray5" />
                  </Avatar>
                  <YStack flex={1}>
                    <XStack justifyContent="space-between" alignItems="center" mb="$2">
                      <Paragraph fontSize="$4" fontWeight="500">
                        {message.sender}
                      </Paragraph>
                      <Paragraph fontSize="$3" color="$gray8">
                        {message.time}
                      </Paragraph>
                    </XStack>
                    <Paragraph fontSize="$4" color="$color" lineHeight="$1">
                      {message.message}
                    </Paragraph>
                  </YStack>
                </XStack>
              </Card.Header>
            </Card>
          ))}
        </>
      ) : (
        <YStack alignItems="center" py="$8">
          <MessageCircle size={48} color="$gray8" />
          <Paragraph fontSize="$4" color="$gray8" mt="$3">
            No messages yet
          </Paragraph>
        </YStack>
      )}
    </YStack>
  );

  return (
    <ScrollView flex={1} bg="$background">
      <YStack flex={1}>
        {/* Event Title */}
        <YStack px="$4" py="$3" bg="$background" borderBottomWidth={1} borderBottomColor="$borderColor">
          <H1 fontSize="$6" fontWeight="600" textAlign="center">
            {event.title}
          </H1>
        </YStack>

        {/* Tab Navigation - Only show if registered */}
        {event.isRegistered && (
          <XStack bg="$background" px="$4" py="$2">
            <TabSegment
              options={[
                { value: 'Details', label: 'Details' },
                { value: 'People', label: 'People' },
                { value: 'Messages', label: 'Messages' }
              ]}
              value={activeTab}
              onValueChange={setActiveTab}
              variant="subtle"
              size="$3"
            />
          </XStack>
        )}

        <YStack px="$4" gap="$4" pb="$8">
          {!event.isRegistered ? (
            renderDetailsTab()
          ) : (
            <>
              {activeTab === 'Details' && renderDetailsTab()}
              {activeTab === 'People' && renderPeopleTab()}
              {activeTab === 'Messages' && renderMessagesTab()}
            </>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  );
}
