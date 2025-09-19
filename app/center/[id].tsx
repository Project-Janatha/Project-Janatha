import React from 'react';
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
  ChevronRight
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

export default function CenterDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
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

  return (
    <ScrollView flex={1} bg="$background">
      <YStack flex={1}>
        {/* Header */}
        <XStack 
          justifyContent="space-between" 
          alignItems="center" 
          px="$4" 
          py="$3"
          bg="$background"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Button
            size="$3"
            circular
            icon={<ArrowLeft size={20} />}
            onPress={() => router.back()}
            variant="outlined"
          />
          <H1 fontSize="$5" fontWeight="600" flex={1} textAlign="center" mx="$3">
            {center.name}
          </H1>
          <Button
            size="$3"
            circular
            icon={<Share size={20} />}
            variant="outlined"
          />
        </XStack>

        {/* Tab Navigation */}
        <XStack bg="$background" px="$4" py="$2">
          <XStack flex={1} bg="$gray3" borderRadius="$3" p="$1">
            <Button flex={1} bg="$orange5" color="$orange11" size="$3" borderRadius="$2">
              Details
            </Button>
            <Button flex={1} bg="transparent" color="$gray10" size="$3">
              Event
            </Button>
          </XStack>
        </XStack>

        <YStack px="$4" gap="$4" pb="$8">
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
            color="white" 
            fontWeight="600"
            mt="$4"
            pressStyle={{ bg: "$orange9" }}
          >
            Make this my center
          </Button>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
