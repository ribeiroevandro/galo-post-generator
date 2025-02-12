import chrome from 'chrome-aws-lambda'

export interface ChromeExecutablePaths {
    win32: string;
    linux: string;
    darwin: string;
    lambda: string;
}

export interface ChromeOptions {
    args: string[];
    executablePath: string;
    headless: boolean;
    ignoreHTTPSErrors?: boolean;
}

const chromeExecPaths: ChromeExecutablePaths = {
    win32: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    linux: '/usr/bin/google-chrome',
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    lambda: '/var/task/.next/server/app/api/bin/chromium'
};

// Type definition for the environment
interface Environment {
    isDev: boolean;
    isLambda: boolean;
}

const detectEnvironment = (): Environment => {
    const isLambda = process.env.AWS_LAMBDA_FUNCTION_VERSION !== undefined;
    const isDev = process.env.NODE_ENV === 'development';
    return { isDev, isLambda };
};

const getExecutablePath = async (env: Environment): Promise<string> => {
    if (env.isLambda) {
        try {
            return await chrome.executablePath
        } catch (error) {
            console.error('Error getting Lambda Chrome path:', error);
            return chromeExecPaths.lambda;
        }
    }

    const platformPath = chromeExecPaths[process.platform as keyof ChromeExecutablePaths];
    if (!platformPath) {
        throw new Error(`Unsupported platform: ${process.platform}`);
    }

    return platformPath;
};

export async function getOptions(isDev?: boolean): Promise<ChromeOptions> {
    const env = detectEnvironment();
    const actualIsDev = isDev ?? env.isDev;

    try {
        if (actualIsDev) {
            return {
                args: [],
                executablePath: await getExecutablePath(env),
                headless: true,
            };
        }

        return {
            args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
            ignoreHTTPSErrors: true,
            executablePath: await getExecutablePath(env),
            headless: chrome.headless,
        };
    } catch (error) {
        console.error('Error configuring Chrome options:', error);
        throw error;
    }
}