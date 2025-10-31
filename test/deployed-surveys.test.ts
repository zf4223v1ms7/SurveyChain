import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getAddress } from 'viem';

interface SurveyEntry {
  id: string;
  title: string;
  description: string;
  address: string;
  options: string[];
  startTime: number;
  endTime: number;
  finalized: boolean;
  optionsCount: number;
}

const loadSurveys = (): SurveyEntry[] => {
  const filePath = resolve(__dirname, '../public/deployed-surveys.json');
  const buffer = readFileSync(filePath, 'utf-8');
  return JSON.parse(buffer) as SurveyEntry[];
};

describe('deployed-surveys.json', () => {
  const surveys = loadSurveys();

  it('contains at least one deployed survey', () => {
    expect(surveys.length).toBeGreaterThan(0);
  });

  it('stores checksum addresses for surveys', () => {
    const addresses = surveys.map((survey) => survey.address);
    const checksummed = addresses.map((addr) => getAddress(addr as `0x${string}`));

    expect(checksummed).toEqual(addresses);
  });

  it('ensures optionsCount matches options length', () => {
    for (const survey of surveys) {
      expect(survey.options.length).toBe(survey.optionsCount);
    }
  });
});
