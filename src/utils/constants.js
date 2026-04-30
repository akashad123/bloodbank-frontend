export const KERALA_DISTRICTS = [
  'Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha',
  'Kottayam','Idukki','Ernakulam','Thrissur',
  'Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod',
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BLOOD_GROUP_COLORS = {
  'A+': 'bg-red-500', 'A-': 'bg-red-700',
  'B+': 'bg-blue-500', 'B-': 'bg-blue-700',
  'AB+': 'bg-purple-500', 'AB-': 'bg-purple-700',
  'O+': 'bg-green-500', 'O-': 'bg-green-700',
};

export const formatDate = (date) => {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};
