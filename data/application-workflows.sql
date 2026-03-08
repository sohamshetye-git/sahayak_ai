-- Sample Application Workflows
-- Define step-by-step workflows for scheme applications

-- PM-KISAN Workflow
INSERT INTO application_workflows (scheme_id, step_number, step_name, step_name_hi, description, description_hi, required_documents, estimated_time_days) VALUES
('PM-KISAN', 1, 'Registration', 'पंजीकरण', 'Register on PM-KISAN portal with Aadhaar', 'आधार के साथ पीएम-किसान पोर्टल पर पंजीकरण करें', ARRAY['Aadhaar Card', 'Bank Account Details', 'Land Records'], 1),
('PM-KISAN', 2, 'Document Upload', 'दस्तावेज़ अपलोड', 'Upload land ownership documents', 'भूमि स्वामित्व दस्तावेज़ अपलोड करें', ARRAY['Land Ownership Certificate', 'Khasra/Khatauni'], 2),
('PM-KISAN', 3, 'Verification', 'सत्यापन', 'Wait for document verification by authorities', 'अधिकारियों द्वारा दस्तावेज़ सत्यापन की प्रतीक्षा करें', ARRAY[], 7),
('PM-KISAN', 4, 'Approval', 'अनुमोदन', 'Application approved and added to beneficiary list', 'आवेदन स्वीकृत और लाभार्थी सूची में जोड़ा गया', ARRAY[], 3),
('PM-KISAN', 5, 'Payment', 'भुगतान', 'Receive installment in bank account', 'बैंक खाते में किस्त प्राप्त करें', ARRAY[], 30);

-- PMAY-G Workflow
INSERT INTO application_workflows (scheme_id, step_number, step_name, step_name_hi, description, description_hi, required_documents, estimated_time_days) VALUES
('PMAY-G', 1, 'Application Submission', 'आवेदन जमा करना', 'Submit application at Gram Panchayat', 'ग्राम पंचायत में आवेदन जमा करें', ARRAY['Aadhaar Card', 'Income Certificate', 'BPL Card'], 1),
('PMAY-G', 2, 'Socio-Economic Survey', 'सामाजिक-आर्थिक सर्वेक्षण', 'Participate in SECC survey', 'एसईसीसी सर्वेक्षण में भाग लें', ARRAY[], 14),
('PMAY-G', 3, 'Beneficiary Selection', 'लाभार्थी चयन', 'Wait for selection in beneficiary list', 'लाभार्थी सूची में चयन की प्रतीक्षा करें', ARRAY[], 30),
('PMAY-G', 4, 'Sanction', 'मंजूरी', 'Receive sanction letter', 'मंजूरी पत्र प्राप्त करें', ARRAY[], 7),
('PMAY-G', 5, 'Construction', 'निर्माण', 'Start house construction with installments', 'किस्तों के साथ घर निर्माण शुरू करें', ARRAY['Construction Plan', 'Site Photos'], 180);

-- NSP Workflow
INSERT INTO application_workflows (scheme_id, step_number, step_name, step_name_hi, description, description_hi, required_documents, estimated_time_days) VALUES
('NSP', 1, 'Online Registration', 'ऑनलाइन पंजीकरण', 'Register on NSP portal', 'एनएसपी पोर्टल पर पंजीकरण करें', ARRAY['Aadhaar Card', 'Student ID', 'Bank Account'], 1),
('NSP', 2, 'Application Form', 'आवेदन पत्र', 'Fill scholarship application form', 'छात्रवृत्ति आवेदन पत्र भरें', ARRAY['Income Certificate', 'Caste Certificate', 'Previous Year Marksheet'], 2),
('NSP', 3, 'Institute Verification', 'संस्थान सत्यापन', 'Institute verifies student details', 'संस्थान छात्र विवरण सत्यापित करता है', ARRAY[], 7),
('NSP', 4, 'Department Approval', 'विभाग अनुमोदन', 'State department approves application', 'राज्य विभाग आवेदन स्वीकृत करता है', ARRAY[], 14),
('NSP', 5, 'Disbursement', 'वितरण', 'Scholarship amount credited to account', 'छात्रवृत्ति राशि खाते में जमा', ARRAY[], 30);

-- PMJAY Workflow
INSERT INTO application_workflows (scheme_id, step_number, step_name, step_name_hi, description, description_hi, required_documents, estimated_time_days) VALUES
('PMJAY', 1, 'Eligibility Check', 'पात्रता जांच', 'Check eligibility on PMJAY website', 'पीएमजेएवाई वेबसाइट पर पात्रता जांचें', ARRAY['Aadhaar Card', 'Ration Card'], 1),
('PMJAY', 2, 'Card Generation', 'कार्ड जनरेशन', 'Visit CSC to generate Ayushman card', 'आयुष्मान कार्ड बनाने के लिए सीएससी पर जाएं', ARRAY['Family ID', 'Photo'], 1),
('PMJAY', 3, 'Biometric Authentication', 'बायोमेट्रिक प्रमाणीकरण', 'Complete biometric verification', 'बायोमेट्रिक सत्यापन पूरा करें', ARRAY[], 1),
('PMJAY', 4, 'Card Activation', 'कार्ड सक्रियण', 'Receive activated Ayushman card', 'सक्रिय आयुष्मान कार्ड प्राप्त करें', ARRAY[], 3),
('PMJAY', 5, 'Hospital Treatment', 'अस्पताल उपचार', 'Use card for cashless treatment', 'कैशलेस उपचार के लिए कार्ड का उपयोग करें', ARRAY['Ayushman Card', 'Medical Documents'], 0);

-- MGNREGA Workflow
INSERT INTO application_workflows (scheme_id, step_number, step_name, step_name_hi, description, description_hi, required_documents, estimated_time_days) VALUES
('MGNREGA', 1, 'Job Card Application', 'जॉब कार्ड आवेदन', 'Apply for MGNREGA job card', 'मनरेगा जॉब कार्ड के लिए आवेदन करें', ARRAY['Aadhaar Card', 'Address Proof', 'Photo'], 1),
('MGNREGA', 2, 'Household Verification', 'घरेलू सत्यापन', 'Gram Panchayat verifies household details', 'ग्राम पंचायत घरेलू विवरण सत्यापित करती है', ARRAY[], 7),
('MGNREGA', 3, 'Job Card Issuance', 'जॉब कार्ड जारी करना', 'Receive MGNREGA job card', 'मनरेगा जॉब कार्ड प्राप्त करें', ARRAY[], 7),
('MGNREGA', 4, 'Work Demand', 'कार्य मांग', 'Submit work demand application', 'कार्य मांग आवेदन जमा करें', ARRAY['Job Card'], 1),
('MGNREGA', 5, 'Work Allocation', 'कार्य आवंटन', 'Get work allocated within 15 days', '15 दिनों के भीतर कार्य आवंटित हो', ARRAY[], 15);

-- PMUY Workflow
INSERT INTO application_workflows (scheme_id, step_number, step_name, step_name_hi, description, description_hi, required_documents, estimated_time_days) VALUES
('PMUY', 1, 'Application Form', 'आवेदन पत्र', 'Fill PMUY application form', 'पीएमयूवाई आवेदन पत्र भरें', ARRAY['Aadhaar Card', 'BPL Card', 'Bank Account'], 1),
('PMUY', 2, 'Document Submission', 'दस्तावेज़ जमा करना', 'Submit documents at LPG distributor', 'एलपीजी वितरक के पास दस्तावेज़ जमा करें', ARRAY['Address Proof', 'Photo'], 1),
('PMUY', 3, 'Verification', 'सत्यापन', 'Distributor verifies documents', 'वितरक दस्तावेज़ सत्यापित करता है', ARRAY[], 3),
('PMUY', 4, 'Connection Installation', 'कनेक्शन स्थापना', 'LPG connection installed at home', 'घर पर एलपीजी कनेक्शन स्थापित', ARRAY[], 7),
('PMUY', 5, 'Subsidy Credit', 'सब्सिडी क्रेडिट', 'Subsidy amount credited to account', 'सब्सिडी राशि खाते में जमा', ARRAY[], 30);
