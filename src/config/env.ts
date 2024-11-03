interface EnvConfig {
  openai: {
    apiKey: string;
  };
  huggingface: {
    apiKey: string;
  };
  deepgram: {
    apiKey: string;
  };
  livekit: {
    apiKey: string;
    secretKey: string;
  };
  nvidia: {
    ngcKey: string;
  };
  convex: {
    deploymentUrl: string;
  };
  mapbox: {
    accessToken: string;
  };
}

export const config: EnvConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY || '',
  },
  deepgram: {
    apiKey: process.env.DEEPGRAM_API_KEY || '',
  },
  livekit: {
    apiKey: process.env.LIVEKIT_API_KEY || '',
    secretKey: process.env.LIVEKIT_SECRET_KEY || '',
  },
  nvidia: {
    ngcKey: process.env.NVIDIA_NGC_API_KEY || '',
  },
  convex: {
    deploymentUrl: process.env.CONVEX_DEPLOYMENT_URL || '',
  },
  mapbox: {
    accessToken: process.env.MAPBOX_ACCESS_TOKEN || '',
  },
};

export function validateConfig() {
  const missingKeys = Object.entries(config)
    .flatMap(([service, keys]) => 
      Object.entries(keys)
        .filter(([_, value]) => !value)
        .map(([key]) => `${service}.${key}`)
    );

  if (missingKeys.length > 0) {
    console.warn('Missing environment variables:', missingKeys.join(', '));
    return false;
  }

  return true;
}