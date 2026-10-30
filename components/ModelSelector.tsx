'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { ChatModel } from '@/types';
import clsx from 'clsx';

interface ModelSelectorProps {
  models: ChatModel[];
  selectedModel: ChatModel | null;
  onModelChange: (model: ChatModel | null) => void;
  isLoading?: boolean;
}

export default function ModelSelector({ 
  models, 
  selectedModel, 
  onModelChange,
  isLoading = false 
}: ModelSelectorProps) {
  if (isLoading) {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model
        </label>
        <div className="relative">
          <div className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-gray-500">Loading models...</span>
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Model
      </label>
      <Listbox value={selectedModel} onChange={onModelChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <span className="flex items-center">
              <CpuChipIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="block truncate">
                {selectedModel ? selectedModel.name : 'Select a model...'}
              </span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {models.length === 0 ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  No models available
                </div>
              ) : (
                models.map((model) => (
                  <Listbox.Option
                    key={model.id}
                    className={({ active }) =>
                      clsx(
                        'relative cursor-default select-none py-2 pl-10 pr-4',
                        active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      )
                    }
                    value={model}
                  >
                    {({ selected }) => (
                      <>
                        <div className="flex flex-col">
                          <span
                            className={clsx(
                              'block truncate',
                              selected ? 'font-medium' : 'font-normal'
                            )}
                          >
                            {model.name}
                          </span>
                          {model.description && (
                            <span className="text-xs text-gray-500 truncate">
                              {model.description}
                            </span>
                          )}
                          {model.context_length && (
                            <span className="text-xs text-gray-400">
                              Context: {model.context_length.toLocaleString()} tokens
                            </span>
                          )}
                        </div>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      
      {selectedModel?.pricing && (
        <div className="mt-2 text-xs text-gray-500">
          Pricing: ${selectedModel.pricing.prompt}/1K prompt tokens, ${selectedModel.pricing.completion}/1K completion tokens
        </div>
      )}
    </div>
  );
}
