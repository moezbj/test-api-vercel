import fs, { ReadStream } from 'fs';
import { access, mkdir } from 'fs/promises';
import { GraphQLResolveInfo } from 'graphql';
import { isEmpty } from 'lodash';
import path from 'path';
import { v4 } from 'uuid';

export const appsDir = path.join(__dirname, '../../../apps/');
export const projectDir = path.join(__dirname, '../../../..');

const DEFAULT_UPLOAD_PATH = path.join(appsDir, '/api/public');

async function uploadFile(
  upload: Promise<{ filename: string; createReadStream: () => ReadStream }>,
  uploadFile: string,
) {
  const { filename, createReadStream } = await upload;
  const data = createReadStream();

  try {
    await access(uploadFile);
  } catch {
    await mkdir(uploadFile);
  }

  return new Promise((resolve, reject) => {
    try {
      const fileName = v4() + filename.slice(filename.lastIndexOf('.'));
      const stream = fs.createWriteStream(path.join(uploadFile, fileName));

      data.pipe(stream);

      stream.on('finish', () => {
        resolve(fileName);
      });

      stream.on('error', (e) => {
        reject(e);
      });
    } catch (e) {
      reject(e);
    }
  });
}

export function Upload() {
  return function (_target: any, _propertyKey: string, descriptor: any) {
    const fn = descriptor.value;
    descriptor.value = async function (
      args: any,
      req: any,
      info: GraphQLResolveInfo,
    ) {
      let nextArgs = args;

      if (args && !isEmpty(this.options.uploads)) {
        const files = await Promise.all(
          Object.entries(this.options.uploads)
            .map(([key, upload]) => {
              if (!args[key]) return null;

              if (Array.isArray(args[key])) {
                return args[key].map((value: any) =>
                  uploadFile(
                    value,
                    (upload as any).path || DEFAULT_UPLOAD_PATH,
                  ),
                );
              }

              return uploadFile(
                args[key],
                (upload as any).path || DEFAULT_UPLOAD_PATH,
              );
            })
            .filter(Boolean),
        );

        nextArgs = {
          ...args,
          ...Object.fromEntries(
            Object.entries(this.options.uploads).map(([key], i) => [
              key,
              files[i],
            ]),
          ),
        };
      }

      return fn.apply(this, [nextArgs, req, info]);
    };
  };
}
