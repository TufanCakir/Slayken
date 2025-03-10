// src/screens/TermsOfServiceScreen.js
import React from "react";
import { ScrollView, Text, View } from "react-native";
import Footer from "../components/Footer";
import styles from "../styles/TermsOfServiceStyles";

export default function TermsOfServiceScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View>
          <Text style={styles.content}>
            Terms of Service{"\n\n"}
            Welcome to [Slayken]! These Terms of Service govern your use of our
            app and services. Please read these terms carefully before using our
            app. By using the app, you agree to these terms.{"\n\n"}
            1. General Provisions{"\n"}
            1.1. These Terms of Service constitute a legally binding agreement
            between you and [Company/Developer Name].{"\n"}
            1.2. By accessing or using the app, you agree to these terms.{"\n"}
            1.3. If you do not agree with these terms, you may not use the app.
            {"\n\n"}
            2. Use of the App{"\n"}
            2.1. The app may only be used for personal and non-commercial
            purposes.{"\n"}
            2.2. You may not copy, modify, distribute, or reverse engineer any
            content or functionality of the app.{"\n"}
            2.3. It is prohibited to bypass the app’s security measures or to
            interfere with our servers, networks, or data.{"\n\n"}
            3. Account and Security{"\n"}
            3.1. If the app requires a user account, you are responsible for
            keeping your login credentials confidential.{"\n"}
            3.2. You may not transfer or sell your account to third parties.
            {"\n"}
            3.3. We reserve the right to suspend or delete accounts that violate
            these Terms of Service.{"\n\n"}
            4. Virtual Content and Purchases{"\n"}
            4.1. The app may include virtual items or in-app purchases.{"\n"}
            4.2. All purchases are final and non-refundable unless required by
            law.{"\n"}
            4.3. We reserve the right to change prices and content at any time.
            {"\n\n"}
            5. Restrictions and Prohibited Activities{"\n"}
            5.1. You may not use the app for illegal or inappropriate purposes.
            {"\n"}
            5.2. Any form of fraud, hacks, or exploits is prohibited.{"\n"}
            5.3. The distribution of offensive, hateful, or harmful content is
            prohibited.{"\n\n"}
            6. Intellectual Property{"\n"}
            6.1. All content, designs, and trademarks in the app are the
            property of [Company/Developer Name] or our licensors.{"\n"}
            6.2. You do not receive any rights or licenses to this content
            except for the use of the app in accordance with these terms.
            {"\n\n"}
            7. Disclaimer{"\n"}
            7.1. Use of the app is at your own risk.{"\n"}
            7.2. We do not guarantee the availability, error-free operation, or
            security of the app.{"\n"}
            7.3. We are not liable for any direct or indirect damages arising
            from the use or unavailability of the app.{"\n\n"}
            8. Changes to the Terms of Service{"\n"}
            8.1. We reserve the right to change these Terms of Service at any
            time.{"\n"}
            8.2. Changes take effect upon publication in the app.{"\n"}
            8.3. If you do not agree with the new terms, you must discontinue
            use of the app.{"\n\n"}
            9. Privacy{"\n"}
            9.1. Your use of the app is subject to our [Privacy Policy](Insert
            link to Privacy Policy).{"\n"}
            9.2. We collect and process personal data in accordance with
            applicable data protection laws.{"\n\n"}
            10. Contact{"\n"}
            If you have any questions regarding these Terms of Service, you can
            contact us at the following email address: [support@slayken.com].
            {"\n\n"}
            By using this app, you agree to these Terms of Service.
          </Text>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
}
