import * as React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

export default function TermsAndPolicy() {
  const router = useRouter();

  const handleBack = () => router.back();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity
          onPress={handleBack}
          className="w-9 h-9 bg-gray-100 rounded-full items-center justify-center"
        >
          <ChevronLeft color="#1F2937" size={20} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Roboto-Bold",
            color: "#111827",
            flex: 1,
            textAlign: "center",
            marginRight: 36,
          }}
        >
          Terms & Conditions
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          <View className="bg-white rounded-xl border border-gray-200 p-4">
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Roboto-Bold",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Welcome to OneStay
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Roboto",
                color: "#4B5563",
                marginBottom: 10,
              }}
            >
              By accessing, browsing resorts, creating an account, or making a
              reservation through this platform, you agree to comply with and be
              bound by the Terms & Conditions stated below. If you do not agree,
              please refrain from using the System.
            </Text>

            {/* Sections */}
            <View className="mt-2">
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto-Bold",
                  color: "#111827",
                  marginBottom: 6,
                }}
              >
                1. Acceptance of Terms
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto",
                  color: "#4B5563",
                  marginBottom: 10,
                }}
              >
                By using the System, you acknowledge that: you have read,
                understood, and agreed to these Terms & Conditions; you are at
                least 18 years old or using the system under the supervision of
                a legal guardian; and all information you provide is accurate
                and truthful.
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto-Bold",
                  color: "#111827",
                  marginBottom: 6,
                }}
              >
                2. User Responsibilities
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto",
                  color: "#4B5563",
                  marginBottom: 10,
                }}
              >
                Users agree to provide accurate personal information when
                creating an account or reservations, verify all reservation
                details before confirmation, use the System only for lawful
                booking purposes, and keep login credentials confidential and
                secure.
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto-Bold",
                  color: "#111827",
                  marginBottom: 6,
                }}
              >
                3. Reservation Policy
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto",
                  color: "#4B5563",
                  marginBottom: 10,
                }}
              >
                Reservations are subject to availability and resort approval.
                Users must provide complete and accurate booking details.
                Misrepresentation may result in automatic cancellation. Some
                reservations require approval or confirmation from resort
                administrators or owners.
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto-Bold",
                  color: "#111827",
                  marginBottom: 6,
                }}
              >
                4. Payment Policy
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto",
                  color: "#4B5563",
                  marginBottom: 10,
                }}
              >
                Depending on resort policy, users must follow payment
                instructions provided by the resort. The System is not
                responsible for issues arising from incorrect payment
                information entered by the user. Fees and rates shown may change
                without prior notice.
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto-Bold",
                  color: "#111827",
                  marginBottom: 6,
                }}
              >
                5. Cancellation and Modification Policy
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto",
                  color: "#4B5563",
                  marginBottom: 10,
                }}
              >
                Cancellation and modification policies are determined by the
                resort. Some bookings may be non-refundable or may incur
                cancellation fees. The System may not allow last-minute changes
                depending on resort rules. It is the user's responsibility to
                review cancellation terms before confirming a reservation.
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto-Bold",
                  color: "#111827",
                  marginBottom: 6,
                }}
              >
                6. Prohibited Activities
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto",
                  color: "#4B5563",
                  marginBottom: 10,
                }}
              >
                Users are not allowed to create fake reservations or use
                fraudulent information, attempt to hack or disrupt the system,
                share login credentials, or misuse the System to harass or
                deceive resort staff or other users.
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto-Bold",
                  color: "#111827",
                  marginBottom: 6,
                }}
              >
                7. Data Privacy
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto",
                  color: "#4B5563",
                  marginBottom: 10,
                }}
              >
                The System collects personal information such as name, email,
                password, booking history, and payment-related information (if
                applicable).
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto-Bold",
                  color: "#111827",
                  marginBottom: 6,
                }}
              >
                8. System Availability
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto",
                  color: "#4B5563",
                  marginBottom: 10,
                }}
              >
                We strive to keep the System online at all times, but do not
                guarantee uninterrupted access. Technical issues, maintenance,
                or server problems may cause downtime. We are not liable for any
                losses caused by temporary unavailability.
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto-Bold",
                  color: "#111827",
                  marginBottom: 6,
                }}
              >
                9. Limitation of Liability
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto",
                  color: "#4B5563",
                  marginBottom: 10,
                }}
              >
                The System is not responsible for inaccurate information
                inputted by the user, cancellation or denial of reservation by
                the resort, payment disputes between the user and the resort, or
                damages caused by misuse, unauthorized access, or third-party
                attacks.
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto-Bold",
                  color: "#111827",
                  marginBottom: 6,
                }}
              >
                10. Account Suspension or Termination
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto",
                  color: "#4B5563",
                  marginBottom: 6,
                }}
              >
                The System administrators reserve the right to suspend or delete
                accounts that violate any of these Terms & Conditions, cancel
                reservations made under suspicious or fraudulent activity, and
                restrict access to maintain system security and integrity.
              </Text>
            </View>
          </View>

          <View className="items-center py-6">
            <Text
              style={{ fontSize: 11, fontFamily: "Roboto", color: "#9CA3AF" }}
            >
              One Stay v1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
