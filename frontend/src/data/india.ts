// Indian States / Union Territories → districts, for dependent dropdowns.
// District lists are a representative (not exhaustive) set — enough to be
// credible in the demo; extend any state's array as needed.

export const INDIA: Record<string, string[]> = {
  'Andhra Pradesh': ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 'Kurnool', 'Nellore', 'Prakasam', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'],
  'Arunachal Pradesh': ['Itanagar', 'Tawang', 'West Kameng', 'East Kameng', 'Papum Pare', 'Lower Subansiri', 'Upper Subansiri', 'Changlang', 'Tirap'],
  'Assam': ['Barpeta', 'Cachar', 'Dibrugarh', 'Dhubri', 'Goalpara', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur', 'Tinsukia'],
  'Bihar': ['Araria', 'Bhagalpur', 'Darbhanga', 'Gaya', 'Gopalganj', 'Muzaffarpur', 'Nalanda', 'Patna', 'Purnia', 'Rohtas', 'Saran', 'Vaishali'],
  'Chhattisgarh': ['Bastar', 'Bilaspur', 'Durg', 'Korba', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Surguja'],
  'Goa': ['North Goa', 'South Goa'],
  'Gujarat': ['Ahmedabad', 'Amreli', 'Anand', 'Bhavnagar', 'Gandhinagar', 'Jamnagar', 'Junagadh', 'Kutch', 'Mehsana', 'Rajkot', 'Surat', 'Vadodara', 'Valsad'],
  'Haryana': ['Ambala', 'Faridabad', 'Gurugram', 'Hisar', 'Karnal', 'Kurukshetra', 'Panipat', 'Rohtak', 'Sonipat', 'Yamunanagar'],
  'Himachal Pradesh': ['Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kullu', 'Mandi', 'Shimla', 'Solan', 'Una'],
  'Jharkhand': ['Bokaro', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Giridih', 'Hazaribagh', 'Ranchi', 'West Singhbhum'],
  'Karnataka': ['Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'],
  'Kerala': ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'],
  'Madhya Pradesh': ['Bhopal', 'Gwalior', 'Indore', 'Jabalpur', 'Rewa', 'Sagar', 'Satna', 'Ujjain'],
  'Maharashtra': ['Ahmednagar', 'Aurangabad', 'Kolhapur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nashik', 'Pune', 'Solapur', 'Thane'],
  'Manipur': ['Imphal East', 'Imphal West', 'Bishnupur', 'Thoubal', 'Churachandpur'],
  'Meghalaya': ['East Khasi Hills', 'West Khasi Hills', 'Ri Bhoi', 'West Garo Hills', 'East Garo Hills'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib', 'Serchhip'],
  'Nagaland': ['Dimapur', 'Kohima', 'Mokokchung', 'Mon', 'Tuensang'],
  'Odisha': ['Angul', 'Balasore', 'Cuttack', 'Ganjam', 'Khordha', 'Puri', 'Sambalpur', 'Sundargarh'],
  'Punjab': ['Amritsar', 'Bathinda', 'Jalandhar', 'Ludhiana', 'Mohali', 'Patiala', 'Hoshiarpur'],
  'Rajasthan': ['Ajmer', 'Alwar', 'Bikaner', 'Jaipur', 'Jodhpur', 'Kota', 'Udaipur'],
  'Sikkim': ['East Sikkim', 'West Sikkim', 'North Sikkim', 'South Sikkim'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Cuddalore', 'Erode', 'Kanchipuram', 'Madurai', 'Salem', 'Thanjavur', 'Tiruchirappalli', 'Tirunelveli', 'Vellore'],
  'Telangana': ['Adilabad', 'Hyderabad', 'Karimnagar', 'Khammam', 'Mahbubnagar', 'Medak', 'Nalgonda', 'Nizamabad', 'Rangareddy', 'Warangal'],
  'Tripura': ['West Tripura', 'South Tripura', 'North Tripura', 'Dhalai'],
  'Uttar Pradesh': ['Agra', 'Aligarh', 'Allahabad (Prayagraj)', 'Bareilly', 'Ghaziabad', 'Gorakhpur', 'Kanpur Nagar', 'Lucknow', 'Meerut', 'Noida (Gautam Buddha Nagar)', 'Varanasi'],
  'Uttarakhand': ['Almora', 'Dehradun', 'Haridwar', 'Nainital', 'Pauri Garhwal', 'Udham Singh Nagar'],
  'West Bengal': ['Bardhaman', 'Darjeeling', 'Howrah', 'Hooghly', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'South 24 Parganas'],
  // Union Territories
  'Andaman and Nicobar Islands': ['North and Middle Andaman', 'South Andaman', 'Nicobar'],
  'Chandigarh': ['Chandigarh'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Dadra and Nagar Haveli', 'Daman', 'Diu'],
  'Delhi': ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'South Delhi', 'West Delhi', 'Shahdara'],
  'Jammu and Kashmir': ['Anantnag', 'Baramulla', 'Jammu', 'Kathua', 'Pulwama', 'Srinagar', 'Udhampur'],
  'Ladakh': ['Leh', 'Kargil'],
  'Lakshadweep': ['Lakshadweep'],
  'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
}

export const INDIAN_STATES: string[] = Object.keys(INDIA).sort()

export function districtsOf(state: string | undefined | null): string[] {
  if (!state) return []
  return INDIA[state] ?? []
}
