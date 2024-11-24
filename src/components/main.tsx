"use client";

import { useState } from 'react';
import { fetchMRDetails, MRDetails } from '@/app/lib/actions/mr_analysis/actions';
import { useSession } from "next-auth/react";
import { ReviewType } from './reviewer_prompts';
import { MRAnalysis } from './mr_details';
import Login from './login';
import { Issue } from '@/app/lib/actions/common/entities/issue';
import IssueBreakdownTool from './issue_breakdown';
import Navbar from './navbar';
import Chat from './chat';
import SettingsPopup from './settings_popup';
import SearchLayout from './search_widget';
import { fetchIssue } from '@/app/lib/actions/issues/actions';
import { Epic } from '@/app/lib/actions/common/entities/epic';
import EpicView from './epic_view';
import { fetchEpic } from '@/app/lib/actions/epic/actions';

export default function Main() {
  const [mrData, setMrData] = useState<MRDetails | null>(null)
  const [issue, setIssue] = useState<Issue | null>(null)
  const [epic, setEpic] = useState<Epic | null>(null)
  const [error, setError] = useState<string | null>(null);
  const [reviewType, setReviewType] = useState<ReviewType>('General')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { data: session } = useSession();

  if (!session) {
    return (
      <Login />
    );
  }

  const handleSubmit = async (url: string) => {
    setError(null);

    try {
      if (url.indexOf("merge_requests") > -1) {
        const customPromptCodeComments = localStorage.getItem('customPromptCodeComments');
        const mrResponse = await fetchMRDetails(url, reviewType, customPromptCodeComments);
        console.log('Merge Request', mrResponse);
        setMrData(mrResponse);
        setIssue(null);
        setEpic(null);
      } else if (url.indexOf("issues") > -1) {
        const fetchedIssue = await fetchIssue(url)
        console.log('Issue', fetchedIssue);
        setIssue(fetchedIssue)
        setMrData(null);
        setEpic(null);
      } else {
        const fetchedEpic = await fetchEpic(url)
        console.log('Epic', fetchedEpic);
        setIssue(null);
        setMrData(null);
        setEpic(fetchedEpic);
      }
      
    } catch (err: unknown) {
      setError((err as {message: string}).message);
      console.error(err);
    }
  };

  return (
    <div>
      <Chat mrDetails={mrData} issue={issue} epic={epic} />

      {isSettingsOpen && <SettingsPopup onClose={() => setIsSettingsOpen(false)} />}
      <Navbar onSettingsClick={() => setIsSettingsOpen(true)} />
      <div className="w-full py-8 px-4">
        <SearchLayout 
          onSubmit={handleSubmit}
          hasResults={!!mrData || !!issue || !!epic}
          reviewType={reviewType}
          setReviewType={setReviewType}
        />

        {error && (
          <div className="text-red-600 mb-4">
            {error}
          </div>
        )}

        {mrData && (
          <MRAnalysis mrData={mrData} />
        )}

        {issue && (
          <IssueBreakdownTool issue={issue} setError={setError} />
        )}

        {epic && (
          <EpicView epicData={epic} />
        )}
      </div>
    </div>
  )
}