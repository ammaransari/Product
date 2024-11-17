const express = require('express');
const { NhostClient } = require('@nhost/nhost-js');
const multer = require('multer');

const app = express();
app.use(express.json()); // To parse JSON request bodies

const nhost = new NhostClient({
  subdomain: 'ltsgltlxdrplvharvvqk',  // Ensure this is the correct subdomain
  region: 'ap-south-1',              // Ensure this is the correct region
});

// Set up Multer for file uploads and store files as buffers
const storage = multer.memoryStorage(); // Use memory storage to access buffer
const upload = multer({ storage });

// Function to sign up a user
async function signUpUser(email, password) {
  try {
    const response = await nhost.auth.signUp({ email, password });
    if (response.error) {
      console.error('Sign-up error:', response.error.message);
      return { success: false, error: response.error.message };
    }
    console.log('Sign-up successful:', response);
    return { success: true, message: 'Sign-up successful, please confirm your email.' };
  } catch (error) {
    console.error('Error in signUpUser:', error);
    throw error;
  }
}

// Route for user sign-up
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await signUpUser(email, password);
    if (result.success) {
      res.status(201).send(result.message);
    } else {
      res.status(400).send(result.error);
    }
  } catch (error) {
    res.status(500).send('An internal error occurred');
  }
});

// Function to log in a user
async function loginUser(email, password) {
  try {
    const response = await nhost.auth.signIn({ email, password });
    console.log('Full login response:', response);
    
    if (response.error) {
      console.error('Login error:', response.error.message);
      return null;
    }
    
    const { session } = response;
    if (session) {
      console.log('Access Token:', session.accessToken);
      return session.accessToken;
    } else {
      console.error('No active session found');
      return null;
    }
  } catch (error) {
    console.error('Error in loginUser:', error);
    throw error;
  }
}

// Route to handle user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await loginUser(email, password);
    if (token) {
      res.status(200).send(`Access Token: ${token}`);
    } else {
      res.status(401).send('Login failed');
    }
  } catch (error) {
    res.status(500).send('An error occurred');
  }
});
const imageStorage = multer.diskStorage({
    // Destination to store image     
    destination: 'uploads', 
      filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() 
             + path.extname(file.originalname))
            // file.fieldname is name of the field (image)
            // path.extname get the uploaded file extension
    }
});
const imageUpload = multer({
    storage: imageStorage,
    limits: {
      fileSize: 1000000 // 1000000 Bytes = 1 MB
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(png|jpg)$/)) { 
         // upload only png and jpg format
         return cb(new Error('Please upload a Image'))
       }
     cb(undefined, true)
  }
}) 
// For Single image upload
app.post('/uploadImage', imageUpload.single('image'), (req, res) => {
    res.send(req.file)
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})
// Route to handle file upload
app.post('/fileupload', upload.single('file'), async (req, res) => {
  try {
    // Log incoming file details
    console.log('Incoming file:', req.body);
    
    const file = req.file;
    if (!file) {
      return res.status(400).send('No file uploaded');
    }

    // Ensure the user is logged in and get an access token
    const token = nhost.auth.getAccessToken();
    console.log('Access Token:', token);

    if (!token) {
      return res.status(401).send('Unauthorized: Login required');
    }

    // Upload the file buffer to Nhost storage
    const response = await nhost.storage.upload({
      file: {
        name: file.originalname,
        type: file.mimetype,
        content: file.buffer, // Use file.buffer for in-memory upload
      },
    });

    if (response.error) {
      console.error('Error uploading file:', response.error.message);
      return res.status(500).send('File upload failed');
    }

    // Return the URL of the uploaded image
    const imageUrl = response.fileMetadata.url;
    console.log('Image URL:', imageUrl);

    res.status(200).send({ imageUrl });
  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).send('An error occurred during file upload');
  }
});

app.listen(3001, () => {
  console.log('Running on port 3001');
});
