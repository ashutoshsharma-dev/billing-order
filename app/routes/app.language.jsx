import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Select,
  RadioButton,
} from "@shopify/polaris";
import { useEffect, useState } from "react";

export default function LanguagePage() {
  // Initialize state with local storage values or defaults
  const [lang, setLang] = useState(
    () => localStorage.getItem("lang") || "single",
  );
  const [firstLang, setFirstLang] = useState(
    () => localStorage.getItem("firstLang") || "English",
  );
  const [secondLang, setSecondLang] = useState(
    () => localStorage.getItem("secondLang") || "Arabic",
  );
  const [invoiceType, setInvoiceType] = useState(
    () => localStorage.getItem("invoiceType") || "single",
  );

  const languages = [
    "Arabic",
    "English",
    "French",
    "Hindi",
    "Japanese",
    "Korean",
    "Mandarin Chinese",
    "Portuguese",
    "Russian",
    "Spanish",
  ];

  // Save state to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("firstLang", firstLang);
  }, [firstLang]);

  useEffect(() => {
    localStorage.setItem("secondLang", secondLang);
  }, [secondLang]);

  useEffect(() => {
    localStorage.setItem("invoiceType", invoiceType);
  }, [invoiceType]);

  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <BlockStack gap="500">
              <Text variant="headingLg" as="h6">
                Invoice Language Options
              </Text>
              <Card>
                <BlockStack gap="500">
                  <BlockStack gap="200">
                    <Card>
                      <InlineStack gap="200">
                        <Button
                          onClick={() => setLang("single")}
                          pressed={lang === "single"}
                        >
                          <strong>Single Language</strong>
                        </Button>
                        <Button
                          onClick={() => {
                            setLang("bilangual");
                            setFirstLang("English");
                          }}
                          pressed={lang === "bilangual"}
                        >
                          <strong>Bilangual</strong>
                        </Button>
                      </InlineStack>
                    </Card>
                  </BlockStack>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="500">
                  <BlockStack gap="200">
                    <Card>
                      <Select
                        label="Select Language 1"
                        options={
                          lang === "bilangual"
                            ? [{ label: "English", value: "English" }]
                            : languages.map((language) => ({
                                label: language,
                                value: language,
                              }))
                        }
                        value={firstLang}
                        onChange={(selected) => setFirstLang(selected)}
                      />
                    </Card>
                  </BlockStack>
                </BlockStack>
              </Card>
              {lang === "bilangual" && (
                <Card>
                  <BlockStack gap="500">
                    <BlockStack gap="200">
                      <Card>
                        <Select
                          label="Select Language 2"
                          options={languages.map((language) => ({
                            label: language,
                            value: language,
                          }))}
                          value={secondLang}
                          onChange={(selected) => setSecondLang(selected)}
                        />
                      </Card>
                    </BlockStack>
                  </BlockStack>
                </Card>
              )}
              <Card>
                <BlockStack gap="500">
                  <BlockStack gap="200">
                    <Card>
                      <BlockStack gap="300">
                        <Text>Invoice Type</Text>
                        <BlockStack gap="100">
                          <RadioButton
                            label="Same Page Invoice"
                            checked={invoiceType === "single"}
                            name="invoice"
                            onChange={() => setInvoiceType("single")}
                          />
                          {lang === "bilangual" && (
                            <RadioButton
                              label="Multi-Page Invoice"
                              name="invoice"
                              checked={invoiceType === "multiple"}
                              onChange={() => setInvoiceType("multiple")}
                            />
                          )}
                        </BlockStack>
                      </BlockStack>
                    </Card>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

// import {
//   Page,
//   Layout,
//   Text,
//   Card,
//   Button,
//   BlockStack,
//   Box,
//   List,
//   Link,
//   InlineStack,
//   IndexTable,
//   LegacyCard,
//   useIndexResourceState,
//   Badge,
//   Select,
//   RadioButton,
// } from "@shopify/polaris";
// import { useEffect, useState } from "react";
// export default function LanguagePage() {
//   const [lang, setLang] = useState("single");
//   const [firstLang, setFirstLang] = useState("English");
//   const [secondLang, setSecondLang] = useState("Arabic");
//   const [invoiceType, setInvoiceType] = useState("single");
//   const languages = [
//     "Arabic",
//     "English",
//     "French",
//     "Hindi",
//     "Japanese",
//     "Korean",
//     "Mandarin Chinese",
//     "Portuguese",
//     "Russian",
//     "Spanish",
//   ];

//   useEffect(() => {
//     console.log(firstLang);
//   }, [firstLang]);

//   return (
//     <Page>
//       <BlockStack gap="500">
//         <Layout>
//           <Layout.Section>
//             <BlockStack gap="500">
//               <Text variant="headingLg" as="h6">
//                 Invoice Language Options
//               </Text>
//               <Card>
//                 <BlockStack gap="500">
//                   <BlockStack gap="200">
//                     <Card>
//                       <InlineStack gap="200">
//                         <Button
//                           onClick={() => setLang("single")}
//                           pressed={lang === "single"}
//                         >
//                           <strong>Single Language</strong>
//                         </Button>
//                         <Button
//                           onClick={() => {
//                             setLang("bilangual");
//                             setFirstLang("English");
//                           }}
//                           pressed={lang === "bilangual"}
//                         >
//                           <strong>Bilangual</strong>
//                         </Button>
//                       </InlineStack>
//                     </Card>
//                   </BlockStack>
//                 </BlockStack>
//               </Card>
//               <Card>
//                 <BlockStack gap="500">
//                   <BlockStack gap="200">
//                     <Card>
//                       <Select
//                         label="Select Language 1"
//                         options={lang === "bilangual" ? ["English"] : languages}
//                         value={firstLang}
//                         onChange={(selected) =>
//                           setFirstLang && setFirstLang(selected)
//                         }
//                       />
//                     </Card>
//                   </BlockStack>
//                 </BlockStack>
//               </Card>
//               {lang === "bilangual" && (
//                 <Card>
//                   <BlockStack gap="500">
//                     <BlockStack gap="200">
//                       <Card>
//                         <Select
//                           label="Select Language 2"
//                           options={languages}
//                           value={secondLang}
//                           onChange={(selected) =>
//                             setSecondLang && setSecondLang(selected)
//                           }
//                         />
//                       </Card>
//                     </BlockStack>
//                   </BlockStack>
//                 </Card>
//               )}
//               <Card>
//                 <BlockStack gap="500">
//                   <BlockStack gap="200">
//                     <Card>
//                       <BlockStack gap="300">
//                         <Text>Invoice Type</Text>
//                         <BlockStack gap="100">
//                           <RadioButton
//                             label="Same Page Invoice"
//                             checked={invoiceType === "single"}
//                             name="invoice"
//                             onChange={() => setInvoiceType("single")}
//                           />
//                           {lang === "bilangual" && (
//                             <RadioButton
//                               label="Multi-Page Invoice"
//                               name="invoice"
//                               checked={invoiceType === "multiple"}
//                               onChange={() => setInvoiceType("multiple")}
//                             />
//                           )}
//                         </BlockStack>
//                       </BlockStack>
//                     </Card>
//                   </BlockStack>
//                 </BlockStack>
//               </Card>
//             </BlockStack>
//           </Layout.Section>
//         </Layout>
//       </BlockStack>
//     </Page>
//   );
// }
